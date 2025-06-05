import { useAtomValue } from 'jotai'

import { slippageValueAndTypeAtom } from '../state/slippageValueAndTypeAtom'

export function useIsSmartSlippageApplied() {
  return useAtomValue(slippageValueAndTypeAtom).type === 'smart'
}
