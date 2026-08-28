import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Long enough to read three words. Below this a label is a flicker rather than
 * information, and several in a row read as the panel malfunctioning.
 */
const MIN_VISIBLE_MS = 700

export interface SteadyStatus {
  status: string | null
  /** Show a label, holding the current one until it has had its moment. */
  show(label: string): void
  /** Clear immediately — the work is over, so nothing is worth waiting for. */
  clear(): void
}

/**
 * Keeps the tool status readable when the work underneath it isn't.
 *
 * Tool blocks can start milliseconds apart, and each one replacing the last turns
 * the status line into a flicker — the label that mattered gone before it could be
 * read. The backend suppresses repeats and lets a lookup's internal steps keep the
 * lookup's label, which fixes the specific case that prompted this; this is the
 * general guard, so no future tool can reintroduce the same problem.
 *
 * Clearing is deliberately immediate. A pending label outliving the turn would leave
 * "Searching the docs…" under a finished answer, which is worse than a brief flicker
 * — it would be untrue.
 */
export function useSteadyStatus(): SteadyStatus {
  const [status, setStatus] = useState<string | null>(null)
  const shownAt = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // ⚠️ The currently-shown label lives in a ref, not read from state, so `show` and
  // `clear` can have empty dependency arrays and never change identity.
  //
  // `send` captures these callbacks once per turn and calls them many times as
  // events arrive. A `show` that depended on `status` would be captured with the
  // value it had when the turn began — null — so every later call would take the
  // "nothing showing yet" branch and apply immediately, quietly disabling the very
  // guard this hook exists to provide.
  const current = useRef<string | null>(null)

  const cancel = useCallback(() => {
    if (timer.current === null) return
    clearTimeout(timer.current)
    timer.current = null
  }, [])

  // A timer that fires after unmount would set state on a dead component.
  useEffect(() => cancel, [cancel])

  const show = useCallback(
    (label: string) => {
      const apply = (): void => {
        shownAt.current = Date.now()
        timer.current = null
        current.current = label
        setStatus(label)
      }

      cancel()

      const remaining = shownAt.current + MIN_VISIBLE_MS - Date.now()
      if (current.current === null || remaining <= 0) {
        apply()
        return
      }

      // Only the newest pending label survives; cancel() above dropped any earlier
      // one, so a burst resolves to where it ended up rather than replaying.
      timer.current = setTimeout(apply, remaining)
    },
    [cancel],
  )

  const clear = useCallback(() => {
    cancel()
    current.current = null
    setStatus(null)
  }, [cancel])

  return { status, show, clear }
}
