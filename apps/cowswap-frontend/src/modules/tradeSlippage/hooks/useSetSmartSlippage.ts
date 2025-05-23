import { useSetAtom } from 'jotai'

import { smartTradeSlippageAtom } from '../state/slippageValueAndTypeAtom'

export function useSetSmartSlippage() {
  return useSetAtom(smartTradeSlippageAtom)
}
