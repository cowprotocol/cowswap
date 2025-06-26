import { useAtomValue } from 'jotai'

import { hooksAtom, HooksStoreState } from './hookDetailsAtom'

export function useHooks(): HooksStoreState {
  return useAtomValue(hooksAtom)
}
