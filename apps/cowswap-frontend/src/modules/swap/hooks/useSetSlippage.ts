import { useSetAtom } from 'jotai'

import { setSwapSlippageAtom } from '../state/slippageValueAndTypeAtom'

export function useSetSlippage() {
  return useSetAtom(setSwapSlippageAtom)
}
