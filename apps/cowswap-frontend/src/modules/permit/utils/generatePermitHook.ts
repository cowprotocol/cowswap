import { Web3Provider } from '@ethersproject/providers'

import { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

import { GP_VAULT_RELAYER } from 'legacy/constants'

import { PermitProviderConnector } from 'modules/wallet/utils/PermitProviderConnector'

import { buildDaiLikePermitCallData, buildEip2162PermitCallData } from './buildPermitCallData'
import { getPermitDeadline } from './getPermitDeadline'

import { DEFAULT_PERMIT_GAS_LIMIT, DEFAULT_PERMIT_VALUE, PERMIT_SIGNER } from '../const'
import { PermitHookData, PermitHookParams } from '../types'

const CACHE_PREFIX = 'permitCache:v0-'
const REQUESTS_CACHE: { [permitKey: string]: Promise<PermitHookData> } = {}

function getCacheKey(params: PermitHookParams): string {
  const { inputToken, chainId, account } = params

  return `${CACHE_PREFIX}${inputToken.address.toLowerCase()}-${chainId}${account ? `-${account}` : ''}`
}

export async function generatePermitHook(params: PermitHookParams): Promise<PermitHookData> {
  const permitKey = getCacheKey(params)

  const cachedResult = localStorage.getItem(permitKey)
  if (cachedResult) return JSON.parse(cachedResult)

  const cachedRequest = REQUESTS_CACHE[permitKey]

  if (cachedRequest) {
    try {
      return await cachedRequest
    } catch (e) {
      console.debug(`[generatePermitHookWith] cached request failed`, e)
      delete REQUESTS_CACHE[permitKey]
    }
  }

  const request = generatePermitHookRaw(params).then((permitHookData) => {
    const permitHook = JSON.stringify(permitHookData)

    localStorage.setItem(permitKey, permitHook)

    return permitHookData
  })

  REQUESTS_CACHE[permitKey] = request

  return request
}

async function generatePermitHookRaw(params: PermitHookParams): Promise<PermitHookData> {
  const { inputToken, chainId, permitInfo, provider, account } = params
  const tokenAddress = inputToken.address
  const tokenName = inputToken.name || tokenAddress

  // TODO: verify whether cached result is still valid and renew it if needed

  const web3ProviderConnector = new PermitProviderConnector(provider, account ? undefined : PERMIT_SIGNER)
  const eip2612PermitUtils = new Eip2612PermitUtils(web3ProviderConnector)

  const owner = account || PERMIT_SIGNER.address

  // TODO: check whether cached permit nonce matches current nonce and update it in case it doesnt

  const nonce = await eip2612PermitUtils.getTokenNonce(tokenAddress, owner)

  const spender = GP_VAULT_RELAYER[chainId]
  const deadline = getPermitDeadline()
  const value = DEFAULT_PERMIT_VALUE

  const callDataPromise =
    permitInfo.type === 'eip-2612'
      ? buildEip2162PermitCallData({
          eip2162Utils: eip2612PermitUtils,
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
      : buildDaiLikePermitCallData({
          eip2162Utils: eip2612PermitUtils,
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

  const callData = await callDataPromise

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
