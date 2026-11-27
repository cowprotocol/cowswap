import { getCurrencyAddress, getWrappedToken } from '@cowprotocol/common-utils'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'

import type { TradeQuoteState } from '../state/tradeQuoteAtom'

export function isQuoteForCurrencies(
  tradeQuote: TradeQuoteState,
  inputCurrency: Currency,
  outputCurrency: Currency,
): boolean {
  const quote = tradeQuote.quote?.quoteResults.quoteResponse.quote

  if (!quote || !isQuoteForChains(tradeQuote, inputCurrency, outputCurrency)) return false

  // A bridge quote's own buy token is the intermediate one on the source chain
  const buyToken = tradeQuote.bridgeQuote ? tradeQuote.bridgeQuote.tradeParameters.buyTokenAddress : quote.buyToken

  return isAddressOfCurrency(quote.sellToken, inputCurrency) && isAddressOfCurrency(buyToken, outputCurrency)
}

// Native currencies are quoted against their wrapped token, so the response may echo either address
function isAddressOfCurrency(address: string, currency: Currency): boolean {
  return (
    areAddressesEqual(address, getCurrencyAddress(currency)) ||
    areAddressesEqual(address, getWrappedToken(currency).address)
  )
}

// Addresses repeat across chains (e.g. the native placeholder), so the chains have to match too
function isQuoteForChains(tradeQuote: TradeQuoteState, inputCurrency: Currency, outputCurrency: Currency): boolean {
  const { bridgeQuote } = tradeQuote

  if (!bridgeQuote) return inputCurrency.chainId === outputCurrency.chainId

  const { sellTokenChainId, buyTokenChainId } = bridgeQuote.tradeParameters

  return sellTokenChainId === inputCurrency.chainId && buyTokenChainId === outputCurrency.chainId
}
