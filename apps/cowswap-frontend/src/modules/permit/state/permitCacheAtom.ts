import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import {
  CachedPermitData,
  GetPermitCacheParams,
  PermitCache,
  PermitCacheKeyParams,
  StorePermitCacheParams,
} from '../types'

/**
 * Atom that stores permit data for static permit requests.
 * Should never change once it has been created.
 * Used exclusively for quote requests
 */
export const staticPermitCacheAtom = atomWithStorage<PermitCache>('staticPermitCache:v3', {})

/**
 * Atom that stores permit data for user permit requests.
 * Should be updated whenever the permit nonce is updated.
 * Used exclusively for order requests
 */
export const userPermitCacheAtom = atomWithStorage<PermitCache>('userPermitCache:v1', {})

/**
 * Atom to add/update permit cache data
 *
 * Input depends on the target type of cache: static or user
 */
export const storePermitCacheAtom = atom(null, (get, set, params: StorePermitCacheParams) => {
  const atomToUpdate = params.account ? userPermitCacheAtom : staticPermitCacheAtom

  const key = buildKey(params)

  const dataToCache: CachedPermitData = {
    hookData: params.hookData,
    nonce: params.nonce,
  }

  set(atomToUpdate, (permitCache) => ({ ...permitCache, [key]: JSON.stringify(dataToCache) }))
})

/**
 * Atom to get the cached permit data.
 *
 * Returns either undefined when no cache or cache is outdated, or the cached permit hook data.
 *
 * When cache is outdated, it will remove the cache key from the target cache.
 * For this reason it's a writable atom.
 */
export const getPermitCacheAtom = atom(null, (get, set, params: GetPermitCacheParams) => {
  const atomToUpdate = params.account ? userPermitCacheAtom : staticPermitCacheAtom

  const permitCache = get(atomToUpdate)
  const key = buildKey(params)
  const cachedData = permitCache[key]

  if (!cachedData) {
    return undefined
  }

  try {
    const { hookData, nonce: storedNonce }: CachedPermitData = JSON.parse(cachedData)

    if (params.account !== undefined) {
      // User type permit cache, check the nonce

      const inputNonce = params.nonce

      if (storedNonce !== undefined && inputNonce !== undefined && storedNonce < inputNonce) {
        // When both nonces exist and storedNonce < inputNonce, data is outdated

        // Remove cache key
        set(atomToUpdate, removePermitCacheBuilder(key))

        return undefined
      }
    }

    // Cache hit for both static and user permit types
    return hookData
  } catch (e) {
    // Failed to parse stored data, clear cache and return nothing

    set(atomToUpdate, removePermitCacheBuilder(key))

    console.info(`[getPermitCacheAtom] failed to parse stored data`, cachedData, e)

    return undefined
  }
})

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function buildKey({ chainId, tokenAddress, account, spender }: PermitCacheKeyParams) {
  const base = `${chainId}-${tokenAddress.toLowerCase()}-${spender.toLowerCase()}`

  return account ? `${base}-${account.toLowerCase()}` : base
}

const removePermitCacheBuilder = (key: string) => (permitCache: PermitCache) => {
  const newPermitCache = { ...permitCache }

  delete newPermitCache[key]

  return newPermitCache
}
