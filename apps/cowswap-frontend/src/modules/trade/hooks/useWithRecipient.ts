import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useIsCurrentTradeBridging } from './useIsCurrentTradeBridging'
import { useIsNonEvmBridging } from './useIsNonEvmBridging'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'

/**
 * Returns whether the recipient input should be shown.
 *
 * Rules:
 * - Always shown when a recipient is set in the URL
 * - Shown for non-EVM bridging when wallet is connected
 * - Shown for SC wallet doing any bridge when wallet is connected
 * - Shown when the user explicitly toggled showRecipient
 * - Never shown during wrap/unwrap flows
 */
export function useWithRecipient(showRecipient: boolean): boolean {
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const isNonEvmBridging = useIsNonEvmBridging()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const isSmartContractWallet = useIsSmartContractWallet()
  const { account } = useWalletInfo()

  const hasRecipientInUrl = !!tradeStateFromUrl?.recipient
  const isSCWalletBridging = isCurrentTradeBridging && !!isSmartContractWallet
  const requiresRecipientForBridge = !!account && (isNonEvmBridging || isSCWalletBridging)

  return !isWrapOrUnwrap && (hasRecipientInUrl || requiresRecipientForBridge || showRecipient)
}
