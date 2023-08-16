import { createJSONStorage } from 'jotai/utils'
import { createStore } from 'jotai/vanilla'

export const jotaiStore = createStore()

/**
 * atomWithStorage() has build-in feature to persist state between all tabs
 * To disable this feature we pass our own instance of storage
 * https://github.com/pmndrs/jotai/pull/1004/files
 *
 * Important!
 * In jotai@2.x they changed the fix above and now we have to patch subscribe method
 */
export const getJotaiIsolatedStorage = <T>() => {
  const storage = createJSONStorage<T>(() => localStorage)

  storage.subscribe = () => () => void 0

  return storage
}
