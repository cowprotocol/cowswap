import { useAtom } from 'jotai/index'

import { wrapNativeStateAtom } from '../state/wrapNativeStateAtom'

export function useWrapNativeScreenState() {
  return useAtom(wrapNativeStateAtom)
}
