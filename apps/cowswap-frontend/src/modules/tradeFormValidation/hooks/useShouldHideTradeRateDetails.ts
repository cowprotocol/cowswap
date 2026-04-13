import { useAtomValue } from 'jotai'

import { useIsWrapOrUnwrap, useShouldHideQuoteAmounts } from 'modules/trade'

import { tradeFormValidationAtom } from '../state/tradeFormValidationAtom'
import { TradeFormValidation } from '../types'

interface Options {
  hideIfWrapUnwrap?: boolean
}

/**
 * Hook to determine if trade rate details and quote-related information should be hidden.
 * Encapsulates the logic of hiding details when a quote is loading, has an error,
 * or when specific validation errors (like xStock minimum trade size) are present.
 */
export function useShouldHideTradeRateDetails(options?: Options): boolean {
  const shouldHideQuoteAmounts = useShouldHideQuoteAmounts()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const validations = useAtomValue(tradeFormValidationAtom)

  const hasXstockError = validations?.includes(TradeFormValidation.XstockMinimumTradeSize)

  return (options?.hideIfWrapUnwrap && isWrapOrUnwrap) || shouldHideQuoteAmounts || !!hasXstockError
}
