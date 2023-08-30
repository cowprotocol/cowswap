import { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

import { GP_VAULT_RELAYER } from 'legacy/constants'

import { PermitProviderConnector } from 'modules/wallet/utils/PermitProviderConnector'

import { buildDaiLikePermitCallData, buildEip2162PermitCallData } from './buildPermitCallData'
import { getPermitDeadline } from './getPermitDeadline'

import { DEFAULT_PERMIT_VALUE, PERMIT_SIGNER } from '../const'
import { PermitHookData, PermitHookParams } from '../types'

const CACHE_PREFIX = 'permitCache:v0-'
const REQUESTS_CACHE: { [permitKey: string]: Promise<PermitHookData> } = {}

function getCacheKey(params: PermitHookParams): string {
  const { inputToken, chainId, account } = params

  return `${CACHE_PREFIX}${inputToken.address.toLowerCase()}-${chainId}${account ? `-${account}` : ''}`
}

export async function generatePermitHook(params: PermitHookParams): Promise<PermitHookData> {
  const { inputToken, chainId, permitInfo, provider, account } = params
  const tokenAddress = inputToken.address
  const tokenName = inputToken.name || tokenAddress
  const permitKey = getCacheKey(params)

  // TODO: verify whether cached result is still valid and renew it if needed
  const cachedResult = localStorage.getItem(permitKey)
  if (cachedResult) return JSON.parse(cachedResult)

  const cachedRequest = REQUESTS_CACHE[permitKey]
  if (cachedRequest) return cachedRequest

  const web3ProviderConnector = new PermitProviderConnector(provider, account ? undefined : PERMIT_SIGNER)
  const eip2612PermitUtils = new Eip2612PermitUtils(web3ProviderConnector)

  const owner = account || PERMIT_SIGNER.address

  // TODO: check whether cached permit nonce matches current nonce and update it in case it doesnt

  const nonce = await eip2612PermitUtils.getTokenNonce(tokenAddress, owner)

  const request = new Promise<PermitHookData>(async (resolve) => {
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

    try {
      const callData = await callDataPromise

      const permitHookData = {
        target: tokenAddress,
        callData,
        gasLimit: permitInfo.gasLimit.toString(),
      }

      const permitHook = JSON.stringify(permitHookData)

      localStorage.setItem(permitKey, permitHook)

      resolve(permitHookData)
    } catch (e) {
      return Promise.reject(e.message)
    }
  })

  REQUESTS_CACHE[permitKey] = request

  return request
}
