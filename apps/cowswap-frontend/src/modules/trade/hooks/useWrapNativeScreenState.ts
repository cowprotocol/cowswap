import { useAtom } from 'jotai'

import { wrapNativeStateAtom } from '../state/wrapNativeStateAtom'

export function useWrapNativeScreenState() {
  return useAtom(wrapNativeStateAtom)
}
