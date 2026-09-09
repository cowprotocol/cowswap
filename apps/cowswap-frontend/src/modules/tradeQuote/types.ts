import { PriceQuality, QuoteAndPost } from '@cowprotocol/cow-sdk'
import type { SolanaQuote } from '@cowprotocol/sdk-trading-solana'

/** A Solana quote carries the order intent/PDA alongside the usual results, so `solanaFlow` can build the
 * `CreateOrder` instruction instead of the quote posting the order itself. */
export type SolanaQuoteAndPost = QuoteAndPost & { solanaQuote: SolanaQuote }

export interface TradeQuoteFetchParams {
  hasParamsChanged: boolean
  priceQuality: PriceQuality
  fetchStartTimestamp: number
}

export interface TradeQuotePollingParameters {
  isConfirmOpen: boolean
  isQuoteUpdatePossible: boolean
  useSuggestedSlippageApi: boolean
  hasPendingTrade: boolean
}

export function isSolanaQuoteAndPost(quote: QuoteAndPost | null): quote is SolanaQuoteAndPost {
  return !!quote && 'solanaQuote' in quote
}
