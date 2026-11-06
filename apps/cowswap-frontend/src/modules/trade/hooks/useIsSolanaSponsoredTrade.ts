import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { isSolanaQuoteAndPost, useTradeQuote } from 'modules/tradeQuote'

import { TradeType } from 'common/modules/tradeNavigation'

import { useDerivedTradeState } from './useDerivedTradeState'

// Mirrors `solanaFlow`'s sponsor pick: the quote's funder pays the fees and rents the accounts the
// order itself needs. The owner still funds the WSOL account a native sell opens, since that account
// is theirs to close — see `useSolanaTradeOverhead`. Limit orders never go through that path.
export function useIsSolanaSponsoredTrade(): boolean {
  const { isSolanaSponsoredOrdersEnabled } = useFeatureFlags()
  const { quote } = useTradeQuote()
  const derivedState = useDerivedTradeState()

  const solanaQuote = isSolanaQuoteAndPost(quote) ? quote.solanaQuote : null

  return Boolean(
    isSolanaSponsoredOrdersEnabled && derivedState?.tradeType !== TradeType.LIMIT_ORDER && solanaQuote?.funder,
  )
}
