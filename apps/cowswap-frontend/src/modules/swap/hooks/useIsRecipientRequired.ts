import { useIsNonEvmBridging } from 'modules/trade'

/**
 * Returns true when a recipient address is required and the toggle must be locked:
 * - non-EVM bridging (SOL, BTC, etc.) — always required, even when disconnected
 */
export function useIsRecipientRequired(): boolean {
  return useIsNonEvmBridging()
}
