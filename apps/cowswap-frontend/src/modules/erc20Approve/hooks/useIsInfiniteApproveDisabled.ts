import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsInfiniteApproveDisabledInWidget } from 'modules/injectedWidget'

/**
 * Whether approving more than the trade needs is unavailable, so the approval is pinned to the
 * trade amount and the partial/full switcher is hidden.
 *
 * Always true on Solana: the delegation is bundled into the order transaction, and until a trade
 * limit caps it an unlimited delegation would leave the settlement authority able to move the
 * whole token account.
 */
export function useIsInfiniteApproveDisabled(): boolean {
  const { chainId } = useWalletInfo()
  const isDisabledInWidget = useIsInfiniteApproveDisabledInWidget()

  return isDisabledInWidget || isSolanaChain(chainId)
}
