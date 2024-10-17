import { useAtomValue } from 'jotai/index'

import { slippageValueAndTypeAtom } from '../state/slippageValueAndTypeAtom'

export function useIsSmartSlippageApplied() {
  return useAtomValue(slippageValueAndTypeAtom).type === 'smart'
}
