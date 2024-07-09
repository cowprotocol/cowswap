import { useAtomValue } from 'jotai'

import { hooksAtom } from '../state/hookDetailsAtom'

export function useHooks() {
  return useAtomValue(hooksAtom)
}
