import { Address, createWalletClient, http, PublicClient } from 'viem'

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

export async function getPermitUtilsInstance({
  chainId,
  publicClient,
  account,
}: {
  chainId: number
  publicClient: PublicClient
  account?: Address
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

  const walletClient = createWalletClient({
    account: account || PERMIT_ACCOUNT,
    chain: publicClient.chain,
    transport: http(),
  })

  const web3ProviderConnector = new PermitProviderConnector(publicClient, walletClient)
  const Eip2612PermitUtilsClass = await import('../imports/1inchPermitUtils').then((r) => r.Eip2612PermitUtils)
  const eip2612PermitUtils = new Eip2612PermitUtilsClass(web3ProviderConnector, { enabledCheckSalt: true })

  if (!account) {
    console.log(`[getPermitUtilsInstance] Set cached chain utils for chain ${chainId}`, eip2612PermitUtils)
    CHAIN_UTILS_CACHE.set(chainId, eip2612PermitUtils)
  } else {
    console.log(
      `[getPermitUtilsInstance] Set cached provider utils for chain ${chainId}-${account}`,
      eip2612PermitUtils,
    )
    PROVIDER_UTILS_CACHE.set(providerCacheKey, eip2612PermitUtils)
  }

  return eip2612PermitUtils
}
