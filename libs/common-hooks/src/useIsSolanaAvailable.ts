import { atom, useAtomValue, useSetAtom } from 'jotai'

import { getIsSolanaEnabledFromWidgetUrl, isInjectedWidget } from '@cowprotocol/common-utils'

// Seeded from the URL so the very first render already agrees with the wallet config, which reads
// the same flag at module load. `SolanaAvailabilityUpdater` keeps it in sync once the widget params
// arrive over postMessage.
const isSolanaEnabledInWidgetAtom = atom(getIsSolanaEnabledFromWidgetUrl())

/**
 * Whether Solana's wallet connector, chain and quotes are loaded. Always on outside the widget;
 * inside it, only for a partner who opted in (see `isSolanaEnabledForWidget`).
 */
export function useIsSolanaAvailable(): boolean {
  const isSolanaEnabledInWidget = useAtomValue(isSolanaEnabledInWidgetAtom)

  return isInjectedWidget() ? isSolanaEnabledInWidget : true
}

export function useSetIsSolanaEnabledInWidget(): (value: boolean) => void {
  return useSetAtom(isSolanaEnabledInWidgetAtom)
}
