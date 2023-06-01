import { useAtomValue } from 'jotai'

import { tradeFormValidationAtom } from '../state/tradeFormValidationAtom'
import { TradeFormValidation } from '../types'

export function useGetTradeFormValidation(): TradeFormValidation | null {
  return useAtomValue(tradeFormValidationAtom)
}
