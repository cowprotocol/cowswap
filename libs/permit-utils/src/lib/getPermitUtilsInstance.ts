import { type Address, createWalletClient, http, type PublicClient, type WalletClient } from 'viem'

import { PERMIT_ACCOUNT } from '../const'
import { PermitProviderConnector } from '../utils/PermitProviderConnector'

import type { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

/**
 * Cache by network. Here we don't care about the provider as a static account will be used for the signature
 */
const CHAIN_UTILS_CACHE = new Map<number, Eip2612PermitUtils>()
/**
 * Cache by provider. Here we cache per provider as each account should have its own instance
 */
const PROVIDER_UTILS_CACHE = new Map<string, Eip2612PermitUtils>()

/**
 * Returns a cached Eip2612PermitUtils instance for querying and signing EIP-2612 permits.
 *
 * Two modes of operation:
 *
 * 1. **Read-only (no `account`)** — Uses a static PERMIT_ACCOUNT with an HTTP transport.
 *    This is used for checking whether a token supports permits, reading nonces, etc.
 *    No real signatures are produced; instances are cached per chainId.
 *
 * 2. **Signing (with `account` + `walletClient`)** — Uses the wagmi wallet client so
 *    `eth_signTypedData_v4` is routed through the user's actual wallet (MetaMask, WalletConnect, etc.).
 *    Plain HTTP transports (e.g. Infura) do NOT support signing, so `walletClient` is required
 *    when an account is provided. Instances are cached per chainId+account.
 *
 * The 1inch `Eip2612PermitUtils` class is lazily imported to keep it out of the main bundle.
 */
export async function getPermitUtilsInstance({
  chainId,
  publicClient,
  account,
  walletClient: wagmiWalletClient,
}: {
  chainId: number
  publicClient: PublicClient
  account?: Address
  walletClient?: WalletClient | null
}): Promise<Eip2612PermitUtils> {
  const chainCache = CHAIN_UTILS_CACHE.get(chainId)

  if (!account && chainCache) {
    return chainCache
  }
  const providerCacheKey = `${chainId}-${account}`
  const providerCache = PROVIDER_UTILS_CACHE.get(providerCacheKey)

  if (providerCache) {
    return providerCache
  }

  // Account-agnostic: read-only RPC (nonces, etc.) — never send user signatures here.
  // With a real account: prefer wagmi's wallet client (WalletConnect / AppKit), then injected, never plain HTTP
  // (Infura etc. do not implement eth_signTypedData_v4).
  let walletClient: WalletClient

  if (!account) {
    walletClient = createWalletClient({
      account: PERMIT_ACCOUNT,
      chain: publicClient.chain,
      transport: http(),
    })
  } else if (wagmiWalletClient) {
    walletClient = wagmiWalletClient
  } else {
    throw new Error('Permit signing needs an active wallet client. Reconnect your wallet or use an injected extension.')
  }

  const web3ProviderConnector = new PermitProviderConnector(publicClient, walletClient)
  const Eip2612PermitUtilsClass = await import('../imports/1inchPermitUtils').then((r) => r.Eip2612PermitUtils)
  const eip2612PermitUtils = new Eip2612PermitUtilsClass(web3ProviderConnector, { enabledCheckSalt: true })

  if (!account) {
    CHAIN_UTILS_CACHE.set(chainId, eip2612PermitUtils)
  } else {
    PROVIDER_UTILS_CACHE.set(providerCacheKey, eip2612PermitUtils)
  }

  return eip2612PermitUtils
}
