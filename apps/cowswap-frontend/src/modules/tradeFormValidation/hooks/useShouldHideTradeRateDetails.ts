import { useShouldHideQuoteAmounts } from 'modules/trade'

import { useGetTradeFormValidations } from './useGetTradeFormValidations'

import { TradeFormValidation } from '../types'

/**
 * Hook to determine if trade rate details and quote-related information should be hidden.
 * Encapsulates the logic of hiding details when a quote is loading, has an error,
 * or when specific validation errors (like xStock minimum trade size) are present.
 */
export function useShouldHideTradeRateDetails(): boolean {
  const shouldHideQuoteAmounts = useShouldHideQuoteAmounts()
  const validations = useGetTradeFormValidations()

  const hasXstockError = validations?.includes(TradeFormValidation.XstockMinimumTradeSize)

  return shouldHideQuoteAmounts || !!hasXstockError
}
