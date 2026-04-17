/**
 * EIP-1193 style request (e.g. underlying provider from connector).
 */
export interface WalletProviderRequest {
  request?(args: unknown): Promise<unknown>
}

/**
 * Shape returned by useWalletProvider() when the connector provides an ethers-like
 * or EIP-1193 wrapper: optional .provider with request, and .send for JSON-RPC.
 * Use for wallet_watchAsset, web3_clientVersion, etc.
 */
export interface WalletProviderLike {
  provider?: WalletProviderRequest
  send(method: string, params?: unknown): Promise<unknown>
}
