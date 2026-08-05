export interface SeedAutoConnectConfig {
  rdns: string
  defaultChainId: number
}

/**
 * Init script (serialized — no imports). Pre-seeds wagmi/AppKit reconnect state so the
 * app boots already connected to the EIP-6963 provider with the given rdns.
 *
 * Key set verified empirically (see src/tests/_discovery flow in the plan) against
 * `@reown/appkit` as pinned in the repo and wagmi storage key `cowswap-wallet`
 * (libs/wallet/src/wagmiStorage.ts):
 *   - `@appkit/eip155:connected_connector_id` is the gate `libs/wallet/src/wagmi/config.ts`
 *     reads at module-eval time to decide `enableReconnect` (`hasRecentConnector`). It holds
 *     the RAW connector id (not JSON-quoted).
 *   - `cowswap-wallet.recentConnectorId` is what wagmi's `reconnect()` reads to pick the
 *     connector to restore. wagmi JSON-serializes stored values, so this one IS quoted.
 * The account itself is restored by wagmi re-invoking the freshly-announced EIP-6963
 * connector's `connect()` (our shim answers `eth_requestAccounts`), so we deliberately do
 * NOT seed the wagmi `.store` — its per-instance connector `uid` would not match the
 * connector created on reload.
 *
 * The chain is derived from the URL hash (`/#/<chainId>/…`) so a plain
 * `page.goto('/#/1/swap')` seeds Mainnet without re-configuring the script.
 */
export function seedAutoConnect(cfg: SeedAutoConnectConfig): void {
  try {
    const match = /^#\/(\d+)\//.exec(window.location.hash)
    const chainId = match ? Number(match[1]) : cfg.defaultChainId
    // Gate read by config.ts hasRecentConnector — RAW string, per-namespace.
    localStorage.setItem('@appkit/eip155:connected_connector_id', cfg.rdns)
    localStorage.setItem('@appkit/connected_namespaces', 'eip155')
    localStorage.setItem('@appkit/active_namespace', 'eip155')
    localStorage.setItem('@appkit/connection_status', 'connected')
    localStorage.setItem('@appkit/active_caip_network_id', `eip155:${chainId}`)
    // wagmi reconnect target — JSON-serialized (quoted) string.
    localStorage.setItem('cowswap-wallet.recentConnectorId', JSON.stringify(cfg.rdns))
  } catch {
    // localStorage unavailable (e.g. about:blank in shim-only tests) — ignore.
  }
}
