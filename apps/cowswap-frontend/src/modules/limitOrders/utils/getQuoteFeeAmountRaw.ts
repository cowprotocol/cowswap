import { isSolanaQuoteAndPost, type TradeQuoteState } from 'modules/tradeQuote'

/**
 * The quote's fee in atoms of the sell token.
 *
 * A Solana quote reports `feeAmount: "0"` and nets its costs out of the amounts instead, so there the
 * fee comes from the SDK's breakdown of those costs.
 */
export function getQuoteFeeAmountRaw(quote: TradeQuoteState['quote']): string | undefined {
  const orderParams = quote?.quoteResults.quoteResponse.quote

  if (!orderParams) return undefined

  if (!isSolanaQuoteAndPost(quote)) return orderParams.feeAmount

  return quote.quoteResults.amountsAndCosts.costs.networkFee.amountInSellCurrency.toString()
}
