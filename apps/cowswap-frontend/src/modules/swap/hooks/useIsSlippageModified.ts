import { useAtomValue } from 'jotai/index'

import { slippageValueAndTypeAtom } from '../state/slippageValueAndTypeAtom'

export function useIsSlippageModified() {
  return useAtomValue(slippageValueAndTypeAtom).type === 'user'
}
