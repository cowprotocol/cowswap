import { reportsFeeInSellToken } from 'modules/trade'
import { isSolanaQuoteAndPost, type TradeQuoteState } from 'modules/tradeQuote'

/**
 * The quote's fee in atoms of the sell token.
 *
 * A Solana quote reports `feeAmount: "0"` and nets its costs out of the amounts instead, so there the
 * fee comes from the SDK's breakdown of those costs. A Solana quote that carries `feeAmount` is taken at its word,
 * as the SDK would count its costs a second time.
 */
export function getQuoteFeeAmountRaw(quote: TradeQuoteState['quote']): string | undefined {
  const orderParams = quote?.quoteResults.quoteResponse.quote

  if (!orderParams) return undefined

  if (!isSolanaQuoteAndPost(quote) || reportsFeeInSellToken(orderParams)) return orderParams.feeAmount

  return quote.quoteResults.amountsAndCosts.costs.networkFee.amountInSellCurrency.toString()
}
