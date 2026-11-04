import { getSolanaCostsInSellAtoms } from 'modules/trade'
import { isSolanaQuoteAndPost, type TradeQuoteState } from 'modules/tradeQuote'

/**
 * The quote's fee in atoms of the sell token.
 *
 * A Solana quote used to report `feeAmount: "0"` and net its costs out of the amounts instead, so there the
 * fee had to be derived from those costs. `getSolanaCostsInSellAtoms` takes a quote that carries the fee
 * at its word, so both shapes land on the same number here.
 */
export function getQuoteFeeAmountRaw(quote: TradeQuoteState['quote']): string | undefined {
  const orderParams = quote?.quoteResults.quoteResponse.quote

  if (!orderParams) return undefined

  if (!isSolanaQuoteAndPost(quote)) return orderParams.feeAmount

  return getSolanaCostsInSellAtoms(orderParams, quote.solanaQuote.costs).toString()
}
