import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { areAddressesEqual, Nullish } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'

import { TradeQuoteState } from 'modules/tradeQuote'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

export function isUnsupportedTokenInQuote(
  state: TradeQuoteState,
  inputCurrency: Nullish<Currency>,
  outputCurrency: Nullish<Currency>,
): boolean {
  if (!(state.error instanceof QuoteApiError) || state.error.type !== QuoteApiErrorCodes.UnsupportedToken) {
    return false
  }

  const { errorQuoteParams } = state

  if (!errorQuoteParams || !inputCurrency || !outputCurrency) return true

  return (
    errorQuoteParams.sellTokenChainId === inputCurrency.chainId &&
    errorQuoteParams.buyTokenChainId === outputCurrency.chainId &&
    areAddressesEqual(errorQuoteParams.sellTokenAddress, getCurrencyAddress(inputCurrency)) &&
    areAddressesEqual(errorQuoteParams.buyTokenAddress, getCurrencyAddress(outputCurrency))
  )
}
