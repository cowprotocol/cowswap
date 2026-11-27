import { isInjectedWidget } from '@cowprotocol/common-utils'

/**
 * Whether Solana's wallet connector, chain and quotes are loaded. Solana is not supported in the
 * widget yet (e.g. partner fees), which is the only place it stays off.
 */
export function useIsSolanaAvailable(): boolean {
  return !isInjectedWidget()
}
