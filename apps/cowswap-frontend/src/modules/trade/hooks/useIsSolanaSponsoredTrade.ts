import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { getIsSolanaSmartContractWallet } from 'tradingSdk/solana/getIsSolanaSmartContractWallet'

import { isSolanaQuoteAndPost, useTradeQuote } from 'modules/tradeQuote'

import { TradeType } from 'common/modules/tradeNavigation'

import { useDerivedTradeState } from './useDerivedTradeState'

// Mirrors `solanaFlow`'s sponsor pick: the quote's funder pays the fees and rents the accounts the
// order itself needs. The owner still funds the WSOL account a native sell opens, since that account
// is theirs to close — see `useSolanaTradeOverhead`. Limit orders never go through that path.
export function useIsSolanaSponsoredTrade(): boolean {
  const { chainId, account } = useWalletInfo()
  const { isSolanaSponsoredOrdersEnabled } = useFeatureFlags()
  const { quote } = useTradeQuote()
  const derivedState = useDerivedTradeState()

  const solanaQuote = isSolanaQuoteAndPost(quote) ? quote.solanaQuote : null
  // A quote outlives the wallet that asked for it, so an EVM account can be current while a Solana
  // quote is still in state.
  const owner = isSolanaChain(chainId) ? account : undefined

  return Boolean(
    isSolanaSponsoredOrdersEnabled &&
      derivedState?.tradeType !== TradeType.LIMIT_ORDER &&
      solanaQuote?.funder &&
      // No owner yet leaves the estimate alone: there is nothing to place.
      (!owner || !getIsSolanaSmartContractWallet(owner)),
  )
}
