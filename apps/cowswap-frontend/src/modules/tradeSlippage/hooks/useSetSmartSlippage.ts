import { useSetAtom } from 'jotai'

import { smartTradeSlippageAtom } from '../state/slippageValueAndTypeAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSetSmartSlippage() {
  return useSetAtom(smartTradeSlippageAtom)
}
