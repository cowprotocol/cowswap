import type { JsonRpcProvider } from '@ethersproject/providers'

import { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

import { PERMIT_SIGNER } from '../const'
import { PermitProviderConnector } from '../utils/PermitProviderConnector'

/**
 * Cache by network. Here we don't care about the provider as a static account will be used for the signature
 */
const CHAIN_UTILS_CACHE = new Map<number, Eip2612PermitUtils>()
/**
 * Cache by provider. Here we cache per provider as each account should have its own instance
 */
const PROVIDER_UTILS_CACHE = new Map<string, Eip2612PermitUtils>()

export function getPermitUtilsInstance(
  chainId: number,
  provider: JsonRpcProvider,
  account?: string | undefined
): Eip2612PermitUtils {
  const chainCache = CHAIN_UTILS_CACHE.get(chainId)

  if (!account && chainCache) {
    return chainCache
  }
  const providerCacheKey = `${chainId}-${account}`
  const providerCache = PROVIDER_UTILS_CACHE.get(providerCacheKey)

  if (providerCache) {
    return providerCache
  }

  // TODO: allow to receive the signer as a parameter
  const web3ProviderConnector = new PermitProviderConnector(provider, account ? undefined : PERMIT_SIGNER)
  const eip2612PermitUtils = new Eip2612PermitUtils(web3ProviderConnector)

  if (!account) {
    console.log(`[getPermitUtilsInstance] Set cached chain utils for chain ${chainId}`, eip2612PermitUtils)
    CHAIN_UTILS_CACHE.set(chainId, eip2612PermitUtils)
  } else {
    console.log(
      `[getPermitUtilsInstance] Set cached provider utils for chain ${chainId}-${account}`,
      eip2612PermitUtils
    )
    PROVIDER_UTILS_CACHE.set(providerCacheKey, eip2612PermitUtils)
  }

  return eip2612PermitUtils
}
