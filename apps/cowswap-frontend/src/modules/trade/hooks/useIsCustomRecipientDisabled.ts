import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

/**
 * Whether a custom recipient can be used at all, for either reason. Drives the recipient input and
 * the reset of any recipient left in trade state — unlike the toggle, which the injected widget
 * hides outright but Solana only greys out.
 */
export function useIsCustomRecipientDisabled(): boolean {
  const isLockedOnSolana = useIsCustomRecipientLockedOnSolana()
  const { disableCustomRecipient } = useInjectedWidgetParams()

  return Boolean(disableCustomRecipient) || isLockedOnSolana
}

/**
 * Whether Solana locks custom recipients off until the backend supports them. The settings toggle
 * stays visible and greyed out, matching `Enable Hooks` and `Enable Partial Approvals`.
 *
 * Only Solana-native trades. Bridging *to* Solana keeps its recipient input — there is no connected
 * Solana wallet to default to there, so `chainId` is the EVM sell chain.
 */
export function useIsCustomRecipientLockedOnSolana(): boolean {
  const { chainId } = useWalletInfo()

  return isSolanaChain(chainId)
}
