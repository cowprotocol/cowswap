import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsInfiniteApproveDisabledInWidget } from 'modules/injectedWidget'

/**
 * Whether approving more than the trade needs is unavailable, so the approval is pinned to the
 * trade amount and the partial/full switcher is hidden.
 *
 * Always true on Solana: the approval there is a token delegation bundled into the order
 * transaction, so an unlimited one leaves the settlement authority able to move the whole token
 * account. The Alpha trade limit does not cover this — it caps the trade, not the delegation.
 */
export function useIsInfiniteApproveDisabled(): boolean {
  const { chainId } = useWalletInfo()
  const isDisabledInWidget = useIsInfiniteApproveDisabledInWidget()

  return isDisabledInWidget || isSolanaChain(chainId)
}
