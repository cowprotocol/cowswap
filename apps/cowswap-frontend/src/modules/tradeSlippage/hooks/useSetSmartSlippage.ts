import { useSetAtom } from 'jotai'

import { setSmartTradeSlippageAtom } from '../state/slippageValueAndTypeAtom'

export function useSetSmartSlippage(): (slippage: number) => void {
  return useSetAtom(setSmartTradeSlippageAtom)
}
