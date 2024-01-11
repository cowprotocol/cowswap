import { createJSONStorage } from 'jotai/utils'
import { createStore } from 'jotai/vanilla'

export const jotaiStore = createStore()

/**
 * atomWithStorage() has build-in feature to persist state between all tabs
 * To disable this feature we pass our own instance of storage
 * https://github.com/pmndrs/jotai/pull/1004/files
 *
 * Important!
 * In jotai@2.x they changed the fix above, and now we have to patch the subscribe method
 */
export const getJotaiIsolatedStorage = <T>() => {
  const storage = createJSONStorage<T>(() => localStorage)

  storage.subscribe = () => () => void 0

  return storage
}

/**
 * Creates a new jotai json storage which merges the existing local storage with given state
 *
 * By default, jotai returns the initial state when localStorage is unset
 * When it's set, though, it takes precedence, even if it doesn't contain info in the initial state.
 * This is why we merge the initial state with the localStorage info.
 *
 * Based on https://github.com/pmndrs/jotai/discussions/1357
 *
 * @returns jotai json storage with merged localStorage info and initial state.
 */
export function getJotaiMergerStorage<T>() {
  const storage = createJSONStorage<T>(() => localStorage)

  function getItem(key: string, initial: T) {
    const value = storage.getItem(key, initial)

    // `initial` comes first, as existing `value` should take precedence
    return { ...initial, ...value }
  }

  return { ...storage, getItem }
}
