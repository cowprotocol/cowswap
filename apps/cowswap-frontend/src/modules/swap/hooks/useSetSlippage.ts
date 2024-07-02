import { useSetAtom } from 'jotai'

import { setSwapSlippageAtom } from '../state/swapSlippageAtom'

export function useSetSlippage() {
  return useSetAtom(setSwapSlippageAtom)
}
