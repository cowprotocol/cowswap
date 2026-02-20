import { atom } from 'jotai'

import { currentTradeQuoteAtom } from 'modules/tradeQuote'

export const shouldHideQuoteAmountsAtom = atom((get) => {
  const { isLoading: isRateLoading, error: quoteError } = get(currentTradeQuoteAtom)

  /**
   * When a quote is loading, or there is an error in the quote result, we should not display values
   */
  return Boolean(isRateLoading || quoteError)
})
