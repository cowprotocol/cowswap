import { getIsSolanaEnabledFromWidgetUrl, isInjectedWidget } from '@cowprotocol/common-utils'

// Read once at module load, exactly like the wallet config reads it to decide the Reown adapters.
// Re-reading per render would drift: in-widget navigation rewrites the hash, and the widget params
// that arrive later over postMessage start out empty, so either source can say "off" while the
// Solana adapter is already built.
const IS_SOLANA_ENABLED_IN_WIDGET = getIsSolanaEnabledFromWidgetUrl()

/**
 * Whether Solana's wallet connector, chain and quotes are loaded. Always on outside the widget;
 * inside it, only for a partner who opted in (see `isSolanaEnabledForWidget`).
 */
export function useIsSolanaAvailable(): boolean {
  return isInjectedWidget() ? IS_SOLANA_ENABLED_IN_WIDGET : true
}
