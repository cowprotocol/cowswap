import { useAtomValue } from 'jotai'

import { slippageValueAndTypeAtom } from '../state/slippageValueAndTypeAtom'

export function useIsSlippageModified() {
  return useAtomValue(slippageValueAndTypeAtom).type === 'user'
}
