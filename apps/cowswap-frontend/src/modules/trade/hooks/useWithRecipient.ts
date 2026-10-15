import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useIsCustomRecipientDisabled } from './useIsCustomRecipientDisabled'
import { useIsNonEvmBridging } from './useIsNonEvmBridging'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'

/**
 * Returns whether the recipient input should be shown.
 *
 * Rules:
 * - Never shown when custom recipients are disabled (injected widget, Solana)
 * - Always shown for non-EVM bridging (SOL, BTC, etc.) — toggle is locked
 * - Always shown when a recipient is set in the URL
 * - Shown when the user explicitly enabled the toggle — regardless of wallet state
 * - Never shown during wrap/unwrap flows
 * - Does NOT depend on EOA vs SC wallet
 */
export function useIsWithRecipient(showRecipient: boolean): boolean {
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isNonEvmBridging = useIsNonEvmBridging()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const isCustomRecipientDisabled = useIsCustomRecipientDisabled()

  const hasRecipientInUrl = !!tradeStateFromUrl?.recipient

  if (isCustomRecipientDisabled) return false

  return !isWrapOrUnwrap && (isNonEvmBridging || hasRecipientInUrl || showRecipient)
}
