import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { isSolanaQuoteAndPost, useTradeQuote } from 'modules/tradeQuote'

import { TradeType } from 'common/modules/tradeNavigation'

import { useDerivedTradeState } from './useDerivedTradeState'

// Mirrors `solanaFlow`'s sponsor pick: a sponsored order is rented and fee-paid by the quote's
// funder, so the owner pays nothing for placement. Limit orders never go through that path.
export function useIsSolanaSponsoredTrade(): boolean {
  const { isSolanaSponsoredOrdersEnabled } = useFeatureFlags()
  const { quote } = useTradeQuote()
  const derivedState = useDerivedTradeState()

  const solanaQuote = isSolanaQuoteAndPost(quote) ? quote.solanaQuote : null

  return Boolean(
    isSolanaSponsoredOrdersEnabled && derivedState?.tradeType !== TradeType.LIMIT_ORDER && solanaQuote?.funder,
  )
}
