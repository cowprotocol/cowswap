export interface SeedAutoConnectConfig {
  rdns: string
  defaultChainId: number
}

/**
 * Init script (serialized — no imports). Pre-seeds wagmi/AppKit reconnect state so the
 * app boots already connected to the EIP-6963 provider with the given rdns.
 *
 * Key set verified empirically against wagmi storage key `cowswap-wallet`
 * (libs/wallet/src/wagmiStorage.ts) and the AppKit version pinned in the repo.
 * The chain is derived from the URL hash (`/#/<chainId>/…`) so a plain
 * `page.goto('/#/1/swap')` seeds Mainnet without re-configuring the script.
 */
export function seedAutoConnect(cfg: SeedAutoConnectConfig): void {
  try {
    const match = /^#\/(\d+)\//.exec(window.location.hash)
    const chainId = match ? Number(match[1]) : cfg.defaultChainId
    // wagmi JSON-serializes stored values — the connector id string is quoted.
    localStorage.setItem('cowswap-wallet.recentConnectorId', JSON.stringify(cfg.rdns))
    localStorage.setItem('@appkit/connection_status', 'connected')
    localStorage.setItem('@appkit/active_caip_network_id', `eip155:${chainId}`)
  } catch {
    // localStorage unavailable (e.g. about:blank in shim-only tests) — ignore.
  }
}
