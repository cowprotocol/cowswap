import { getIsSameTradeQuoteRefreshing, useTradeQuote } from 'modules/tradeQuote'

import { useGetTradeFormValidation } from './useGetTradeFormValidation'
import { useGetTradeFormValidations } from './useGetTradeFormValidations'

import { TradeFormValidation } from '../types'

export const ACTIVE_VALIDATION_CASES: readonly TradeFormValidation[] = [
  TradeFormValidation.ApproveAndSwapInBundle,
  TradeFormValidation.ApproveRequired,
  TradeFormValidation.SellNativeToken,
]

export function useIsTradeFormValidationPassed(): boolean {
  const primaryFormValidation = useGetTradeFormValidation()

  return getIsValidationPassed(primaryFormValidation)
}

export function useIsTradeFormValidationPassedOrRefreshing(): boolean {
  const validations = useGetTradeFormValidations()
  const tradeQuote = useTradeQuote()
  const primaryFormValidation = validations?.[0] ?? null

  if (primaryFormValidation !== TradeFormValidation.QuoteLoading || !getIsSameTradeQuoteRefreshing(tradeQuote)) {
    return getIsValidationPassed(primaryFormValidation)
  }

  const nextFormValidation = validations?.find((validation) => validation !== TradeFormValidation.QuoteLoading)

  return getIsValidationPassed(nextFormValidation ?? null)
}

function getIsValidationPassed(primaryFormValidation: TradeFormValidation | null): boolean {
  return !primaryFormValidation || ACTIVE_VALIDATION_CASES.includes(primaryFormValidation)
}
