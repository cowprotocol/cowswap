import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsSolanaSponsoredTrade } from './useIsSolanaSponsoredTrade'

/** False only on Solana without a sponsor, where the owner pays the rent and transaction fee. */
export function useIsFreeOrderPlacement(): boolean {
  const { chainId } = useWalletInfo()
  const isSponsored = useIsSolanaSponsoredTrade()

  return !isSolanaChain(chainId) || isSponsored
}
