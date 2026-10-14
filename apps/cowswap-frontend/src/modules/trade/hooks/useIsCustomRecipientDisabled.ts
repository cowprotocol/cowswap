import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

/**
 * Whether custom recipients are unavailable: the injected widget turned them off, or the trade is on
 * Solana, where they stay hidden until the backend supports them.
 *
 * Only Solana-native trades. Bridging *to* Solana keeps its recipient input — there is no connected
 * Solana wallet to default to there, so `chainId` is the EVM sell chain.
 */
export function useIsCustomRecipientDisabled(): boolean {
  const { chainId } = useWalletInfo()
  const { disableCustomRecipient } = useInjectedWidgetParams()

  return Boolean(disableCustomRecipient) || isSolanaChain(chainId)
}
