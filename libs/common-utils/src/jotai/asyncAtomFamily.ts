import { atom, type Atom } from 'jotai'

import { atomFamily, type AtomFamily } from 'jotai-family'

export interface AsyncAtomFamilyOptions<P, T> {
  /** Passed to `atomFamily` when params must be compared by value (not reference). */
  areEqual?: (a: P, b: P) => boolean
  /** When cached family size exceeds this value, logs a possible leak warning. */
  maxFamilyMembersWarning?: number
  /** Prefix for warning / error logs. */
  familyLabel?: string
  /** Written when `fetcher` rejects. If omitted, errors are logged and the atom stays `null` (loading). */
  valueOnError?: T
}

const DEFAULT_OPTIONS = {
  areEqual: undefined,
  maxFamilyMembersWarning: 4,
  familyLabel: 'asyncAtomFamily',
  valueOnError: undefined,
} as const satisfies AsyncAtomFamilyOptions<unknown, unknown>

/**
 * Atom family where each member loads async data once on mount.
 *
 * - Atom value is `T | null`: `null` means loading; a resolved `fetcher` result replaces it.
 * - If `fetcher` resolves to `null`, the value is left unchanged (skip / early exit).
 * - On unmount, the param is removed from the family cache to avoid memory leaks.
 *
 * Why are we doing the cleanup using `onMount` instead of `setShouldRemove`?
 * Well, `setShouldRemove` runs immediately and when you are about to get an
 * atom from the cache. Internally, atomFamily is just a Map whose key is a
 * param and whose value is an atom config. Unless you explicitly remove unused
 * params, this leads to memory leaks. This is crucial if you use infinite
 * number of params.
 */
export function asyncAtomFamily<P, T>(
  fetcher: (params: P) => Promise<T | null>,
  options?: AsyncAtomFamilyOptions<P, T>,
): AtomFamily<P, Atom<T | null>> {
  const { areEqual, maxFamilyMembersWarning, familyLabel, valueOnError } = { ...DEFAULT_OPTIONS, ...options }

  const family = atomFamily((params: P) => {
    const dataAtom = atom<T | null>(null)

    dataAtom.onMount = (set) => {
      const count = [...family.getParams()].length

      if (count > maxFamilyMembersWarning) {
        console.warn(
          `[${familyLabel}] Possible memory leak: ${count} cached family members (threshold ${maxFamilyMembersWarning})`,
        )
      }

      let cancelled = false

      fetcher(params)
        .then((result) => {
          if (cancelled) return
          if (result === null) return
          set(result)
        })
        .catch((error: unknown) => {
          console.error(`[${familyLabel}] error`, error)

          if (cancelled) return
          if (valueOnError !== undefined) {
            set(valueOnError)
          }
        })

      return () => {
        cancelled = true
        family.remove(params)
      }
    }

    return dataAtom
  }, areEqual)

  return family
}
