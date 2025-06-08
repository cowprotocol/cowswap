import { atomWithStorage, createJSONStorage } from 'jotai/utils'
import { createStore } from 'jotai/vanilla'

import { AsyncStringStorage } from 'jotai/vanilla/utils/atomWithStorage'
import { createInstance } from 'localforage'

export const jotaiStore = createStore()

const localForageJotai = createInstance({
  name: 'cowswap_jotai',
})

/**
 * atomWithStorage() has build-in feature to persist state between all tabs
 * To disable this feature we pass our own instance of storage
 * https://github.com/pmndrs/jotai/pull/1004/files
 *
 * Important!
 * In jotai@2.x they changed the fix above, and now we have to patch the subscribe method
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getJotaiMergerStorage<T>() {
  const storage = createJSONStorage<T>(() => localStorage)

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function getItem(key: string, initial: T) {
    const value = storage.getItem(key, initial)

    // `initial` comes first, as existing `value` should take precedence
    return { ...initial, ...value }
  }

  return { ...storage, getItem }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function atomWithIdbStorage<Value>(key: string, initialValue: Value) {
  const storage: AsyncStringStorage = {
    async getItem(key: string): Promise<string | null> {
      return localForageJotai.getItem(key).then((result) => result as string | null)
    },
    async setItem(key: string, newValue: string): Promise<void> {
      await localForageJotai.setItem(key, newValue)
    },
    async removeItem(key: string): Promise<void> {
      await localForageJotai.removeItem(key)
    },
  }

  return atomWithStorage<Value>(
    key,
    initialValue,
    createJSONStorage(() => storage),
    { unstable_getOnInit: true },
  )
}
