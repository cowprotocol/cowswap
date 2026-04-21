import { useWalletInfo } from '@cowprotocol/wallet'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useIsNonEvmBridging } from './useIsNonEvmBridging'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'

/**
 * Returns whether the recipient input should be shown.
 *
 * Rules:
 * - Always shown when a recipient is set in the URL
 * - Always shown for non-EVM bridging (required, even without wallet connected)
 * - Shown when wallet is connected and the user explicitly toggled showRecipient
 * - Never shown during wrap/unwrap flows
 */
export function useWithRecipient(showRecipient: boolean): boolean {
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const { account } = useWalletInfo()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const isNonEvmBridging = useIsNonEvmBridging()

  const hasRecipientInUrl = !!tradeStateFromUrl?.recipient

  return !isWrapOrUnwrap && (hasRecipientInUrl || isNonEvmBridging || (!!account && showRecipient))
}
