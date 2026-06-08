import { useGetTradeFormValidation } from './useGetTradeFormValidation'

import { TradeFormValidation } from '../types'

export const ACTIVE_VALIDATION_CASES: readonly TradeFormValidation[] = [
  TradeFormValidation.ApproveAndSwapInBundle,
  TradeFormValidation.ApproveRequired,
  TradeFormValidation.SellNativeToken,
]

export function useIsTradeFormValidationPassed(): boolean {
  const primaryFormValidation = useGetTradeFormValidation()

  return !primaryFormValidation || ACTIVE_VALIDATION_CASES.includes(primaryFormValidation)
}
