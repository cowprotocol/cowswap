import { useSetAtom } from 'jotai'

import { setTradeSlippageAtom } from '../state/slippageValueAndTypeAtom'

export function useSetSlippage() {
  return useSetAtom(setTradeSlippageAtom)
}
