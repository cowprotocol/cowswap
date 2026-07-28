import { EIP1193Provider } from 'viem'

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

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
        const connector = adapter.wagmiConfig.connectors.find((c) => c.uid === current)
        if (!connector) {
          // `current` points to no live connector. Connector uids are regenerated every load,
          // so a persisted `current` from a previous session (with connections not yet hydrated)
          // never matches — this is stale hydration state, NOT a user disconnect. Keep events
          // flowing so reconnection can proceed; only block once we've had a real provider this
          // session. Otherwise `accountsChanged` is silenced and the wallet never reconnects.
          activeProviderRef.current = hasEverConnected ? PROVIDER_DISCONNECTED : null
          return
        }
        hasEverConnected = true
        const provider = (await connector.getProvider().catch(() => null)) as EIP1193Provider | null

        // Ignore stale resolution — a newer subscribe call may have fired while we awaited.
        if (version !== syncVersion) return

        activeProviderRef.current = provider
      },
      { emitImmediately: true },
    )
  }
}
