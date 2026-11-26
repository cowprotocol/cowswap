export interface SeedSolanaAutoConnectConfig {
  /** Reown's connector id for a standard wallet, which is the wallet's own name when unknown to it. */
  connectorId: string
  caipNetworkId: string
}

/**
 * Init script (serialized — no imports). Pre-seeds AppKit reconnect state for the Solana namespace,
 * the counterpart of {@link seedAutoConnect} for EVM.
 *
 * `@appkit/solana:connected_connector_id` is the key `libs/wallet/src/wagmi/config.ts` reads at
 * module-eval time for `hasRecentConnector`, which gates `enableReconnect`. Solana is not managed by
 * wagmi, so unlike the EVM path there is no second wagmi key to seed — the account comes back when
 * AppKit re-invokes the freshly-registered standard wallet's `connect()`.
 */
export function seedSolanaAutoConnect(cfg: SeedSolanaAutoConnectConfig): void {
  try {
    localStorage.setItem('@appkit/solana:connected_connector_id', cfg.connectorId)
    localStorage.setItem('@appkit/connected_namespaces', 'solana')
    localStorage.setItem('@appkit/active_namespace', 'solana')
    localStorage.setItem('@appkit/connection_status', 'connected')
    localStorage.setItem('@appkit/active_caip_network_id', cfg.caipNetworkId)
  } catch {
    // localStorage unavailable (e.g. about:blank in shim-only tests) — ignore.
  }
}
