import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'

import { setJsonToLocalStorage } from '@cowprotocol/common-utils'

import { useDebounce } from './useDebounce'

type LocalStorageResolveValue<T> = (persistedValue: unknown) => T

type LocalStorageDefaultValue<T> = T | LocalStorageResolveValue<T>

function isPrimitive(value: unknown): value is string | number | boolean | bigint | symbol | null | undefined {
  return value === null || (typeof value !== 'object' && typeof value !== 'function')
}

function isLocalStorageResolveValue<T>(
  defaultValue: LocalStorageDefaultValue<T>,
): defaultValue is LocalStorageResolveValue<T> {
  return typeof defaultValue === 'function'
}

function readStoredValue(storageKey: string): unknown {
  const raw = localStorage.getItem(storageKey)

  if (raw === null) {
    return null
  }

  try {
    return JSON.parse(raw) as unknown
  } catch {
    return raw
  }
}

function writeStoredValue<T>(storageKey: string, value: T): void {
  setJsonToLocalStorage(storageKey, value)
}

function resolveStoredValue<T>(storageKey: string, defaultValue: LocalStorageDefaultValue<T>): T {
  const persistedValue = readStoredValue(storageKey)

  if (isLocalStorageResolveValue(defaultValue)) {
    const resolved = defaultValue(persistedValue)

    if (persistedValue !== resolved && isPrimitive(resolved)) {
      writeStoredValue(storageKey, resolved)
    }

    return resolved
  }

  const resolved = persistedValue != null ? (persistedValue as T) : defaultValue

  if (persistedValue !== resolved && isPrimitive(resolved)) {
    writeStoredValue(storageKey, resolved)
  }

  return resolved
}

type LocalStorageStaticValue<T> = T extends (persistedValue: unknown) => unknown ? never : T

/**
 * React state synced with `localStorage`, with optional debounced writes.
 *
 * @param storageKey - Key used for JSON serialization in `localStorage`.
 * @param defaultValue - Static fallback when nothing is stored, or a resolver
 *   `(persistedValue) => T` to validate, migrate, or normalize the stored value.
 *   When the resolver returns a primitive that differs from what was read, the
 *   corrected value is written back immediately.
 * @param delayMs - Debounce delay for persistence writes. `0` (default) writes on every update.
 * @returns A `[value, setValue]` tuple matching `useState`.
 */
export function useLocalStorageState<T>(
  storageKey: string,
  resolveValue: LocalStorageResolveValue<T>,
  delayMs?: number,
): [T, Dispatch<SetStateAction<T>>]

export function useLocalStorageState<T>(
  storageKey: string,
  defaultValue: LocalStorageStaticValue<T>,
  delayMs?: number,
): [T, Dispatch<SetStateAction<T>>]

export function useLocalStorageState<T>(
  storageKey: string,
  defaultValue: LocalStorageDefaultValue<T>,
  delayMs = 0,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => resolveStoredValue(storageKey, defaultValue))
  const debouncedState = useDebounce(state, delayMs)

  useEffect(() => {
    if (delayMs <= 0) {
      return
    }

    writeStoredValue(storageKey, debouncedState)
  }, [debouncedState, delayMs, storageKey])

  const setPersistedState = useCallback(
    (value: SetStateAction<T>) => {
      setState((prevState) => {
        const nextState = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value

        if (delayMs <= 0) {
          writeStoredValue(storageKey, nextState)
        }

        return nextState
      })
    },
    [delayMs, storageKey],
  )

  return [state, setPersistedState]
}
