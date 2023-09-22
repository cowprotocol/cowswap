import { GP_VAULT_RELAYER } from '@cowprotocol/common-const'
import { Web3Provider } from '@ethersproject/providers'

import { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

import { buildDaiLikePermitCallData, buildEip2162PermitCallData } from './buildPermitCallData'
import { getPermitDeadline } from './getPermitDeadline'
import { getPermitUtilsInstance } from './getPermitUtilsInstance'

import { DEFAULT_PERMIT_GAS_LIMIT, DEFAULT_PERMIT_VALUE, PERMIT_SIGNER } from '../const'
import { PermitHookData, PermitHookParams } from '../types'

const CACHE_PREFIX = 'permitCache:v0-'
const REQUESTS_CACHE: { [permitKey: string]: Promise<PermitHookData> } = {}

export async function generatePermitHook(params: PermitHookParams): Promise<PermitHookData> {
  const permitKey = getCacheKey(params)

  const { chainId, provider, account, inputToken } = params

  const eip2162Utils = getPermitUtilsInstance(chainId, provider, account)

  // Always get the nonce for the real account, to know whether the cache should be invalidated
  // Static account should never need to pre-check the nonce as it'll never change once cached
  const nonce = account ? await eip2162Utils.getTokenNonce(inputToken.address, account) : undefined

  const cachedResult = load(permitKey, nonce)
  if (cachedResult) {
    return cachedResult
  }

  const cachedRequest = REQUESTS_CACHE[permitKey]

  if (cachedRequest) {
    try {
      return await cachedRequest
    } catch (e) {
      console.debug(`[generatePermitHookWith] cached request failed`, e)
      delete REQUESTS_CACHE[permitKey]
    }
  }

  const request = generatePermitHookRaw({ ...params, eip2162Utils, preFetchedNonce: nonce }).then((permitHookData) => {
    // Store permit in the cache
    save(permitKey, nonce, permitHookData)

    // Remove consumed request to avoid stale data
    delete REQUESTS_CACHE[permitKey]

    return permitHookData
  })

  REQUESTS_CACHE[permitKey] = request

  return request
}

async function generatePermitHookRaw(
  params: PermitHookParams & { eip2162Utils: Eip2612PermitUtils; preFetchedNonce: number | undefined }
): Promise<PermitHookData> {
  const { inputToken, chainId, permitInfo, provider, account, eip2162Utils, preFetchedNonce } = params
  const tokenAddress = inputToken.address
  const tokenName = inputToken.name || tokenAddress

  const owner = account || PERMIT_SIGNER.address

  // Only fetch the nonce in case it wasn't pre-fetched before
  // That's the case for static account
  const nonce = preFetchedNonce === undefined ? await eip2162Utils.getTokenNonce(tokenAddress, owner) : preFetchedNonce

  const spender = GP_VAULT_RELAYER[chainId]
  const deadline = getPermitDeadline()
  const value = DEFAULT_PERMIT_VALUE

  const callData =
    permitInfo.type === 'eip-2612'
      ? await buildEip2162PermitCallData({
          eip2162Utils,
          callDataParams: [
            {
              owner,
              spender,
              value,
              nonce,
              deadline,
            },
            chainId as number,
            tokenName,
            tokenAddress,
          ],
        })
      : await buildDaiLikePermitCallData({
          eip2162Utils,
          callDataParams: [
            {
              holder: owner,
              spender,
              allowed: true,
              value,
              nonce,
              expiry: deadline,
            },
            chainId as number,
            tokenName,
            tokenAddress,
          ],
        })

  const gasLimit = await calculateGasLimit(callData, owner, tokenAddress, provider, !!account)

  return {
    target: tokenAddress,
    callData,
    gasLimit,
  }
}

async function calculateGasLimit(
  data: string,
  from: string,
  to: string,
  provider: Web3Provider,
  isUserAccount: boolean
): Promise<string> {
  try {
    // Query the actual gas estimate
    const actual = await provider.estimateGas({ data, from, to })

    // Add 10% to actual value to account for minor differences with real account
    // Do not add it if this is the real user's account
    const gasLimit = !isUserAccount ? actual.add(actual.div(10)) : actual

    // Pick the biggest between estimated and default
    return gasLimit.gt(DEFAULT_PERMIT_GAS_LIMIT) ? gasLimit.toString() : DEFAULT_PERMIT_GAS_LIMIT
  } catch (e) {
    console.debug(`[calculatePermitGasLimit] Failed to estimateGas, using default`, e)

    return DEFAULT_PERMIT_GAS_LIMIT
  }
}

function getCacheKey(params: PermitHookParams): string {
  const { inputToken, chainId, account } = params

  return `${CACHE_PREFIX}${inputToken.address.toLowerCase()}-${chainId}${account ? `-${account.toLowerCase()}` : ''}`
}

type CachedData = PermitHookData & {
  nonce: number | undefined
}

/**
 * Stores data based on `key` and `nonce`
 */
function save(key: string, nonce: number | undefined, data: PermitHookData): void {
  const cachedData: CachedData = { nonce, ...data }

  localStorage.setItem(key, JSON.stringify(cachedData))
}

/**
 * Loads stored data if still valid
 *
 * Validity is based on `nonce` and only applies to real accounts
 * Static data never gets invalidated
 */
function load(key: string, nonce: number | undefined): PermitHookData | undefined {
  const cachedData = localStorage.getItem(key)

  if (!cachedData) {
    return undefined
  }

  try {
    const parsedData: CachedData = JSON.parse(cachedData)

    // Extract nonce out of cached data
    const { nonce: storedNonce, ...permitHookData } = parsedData

    // TODO: if one is defined while the other is not, should also ignore the cache
    if (nonce !== undefined && storedNonce !== undefined && storedNonce < nonce) {
      // When both nonces exist and stored is < than new, data is outdated

      // Remove cache key
      localStorage.removeItem(key)

      return undefined
    }

    // Cache is valid, return it
    return permitHookData
  } catch {
    // Failed to parse stored data, return nothing
    return undefined
  }
}
