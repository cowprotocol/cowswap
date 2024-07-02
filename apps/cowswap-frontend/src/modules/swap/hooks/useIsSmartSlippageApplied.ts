import { useAtomValue } from 'jotai/index'

import { isSmartSlippageAppliedAtom } from '../state/swapSlippageAtom'

export function useIsSmartSlippageApplied() {
  return useAtomValue(isSmartSlippageAppliedAtom)
}
