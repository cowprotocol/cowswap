import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { EIP1193Provider } from 'viem'

import { activeProviderRef, PROVIDER_DISCONNECTED } from './providerIsolation'

export function bindActiveProvider(adapter: WagmiAdapter): void {
  // Keep activeProviderRef in sync with the active connector so the per-tab
  // accountsChanged filter in providerIsolation.ts knows which provider is current.
  if (typeof window !== 'undefined') {
    let hasEverConnected = false
    let syncVersion = 0

    adapter.wagmiConfig.subscribe(
      (state) => state.current,
      async (current) => {
        const version = ++syncVersion

        if (!current) {
          // Distinguish "never connected yet" (null, let events through for reconnection)
          // from "was connected, now disconnected" (PROVIDER_DISCONNECTED, block events).
          activeProviderRef.current = hasEverConnected ? PROVIDER_DISCONNECTED : null
          return
        }
        hasEverConnected = true
        const connector = adapter.wagmiConfig.connectors.find((c) => c.uid === current)
        if (!connector) {
          activeProviderRef.current = PROVIDER_DISCONNECTED
          return
        }
        const provider = (await connector.getProvider().catch(() => null)) as EIP1193Provider | null

        // Ignore stale resolution — a newer subscribe call may have fired while we awaited.
        if (version !== syncVersion) return

        activeProviderRef.current = provider
      },
      { emitImmediately: true },
    )
  }
}
