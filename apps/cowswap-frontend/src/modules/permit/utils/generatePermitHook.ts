import { MaxUint256 } from '@ethersproject/constants'

import { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

import { GP_VAULT_RELAYER } from 'legacy/constants'

import { buildDaiLikePermitCallData, buildEip2162PermitCallData } from './buildPermitCallData'
import { Web3ProviderConnector } from './Web3ProviderConnector'

import { FAKE_SIGNER } from '../const'
import { PermitHookParams } from '../types'

const cachePrefix = 'permitCache-'
const pendingRequests: { [permitKey: string]: Promise<string> | undefined } = {}

const FIVE_YEARS_IN_SECONDS = 5 * 365 * 24 * 60 * 60

function getDeadline() {
  return Math.ceil(Date.now() / 1000) + FIVE_YEARS_IN_SECONDS
}

export async function generateQuotePermitHook(params: PermitHookParams): Promise<string> {
  const { inputToken, chainId, permitInfo, provider, account } = params
  const tokenAddress = inputToken.address
  const tokenName = inputToken.name || tokenAddress
  const permitKey = `${cachePrefix}${inputToken.address.toLowerCase()}-${chainId}${account ? `-${account}` : ''}`

  if (localStorage.getItem(permitKey)) return localStorage.getItem(permitKey)!
  if (pendingRequests[permitKey]) return pendingRequests[permitKey]!

  const web3ProviderConnector = new Web3ProviderConnector(provider, account ? undefined : FAKE_SIGNER)
  const eip2612PermitUtils = new Eip2612PermitUtils(web3ProviderConnector)

  const owner = account || FAKE_SIGNER.address

  // TODO: check whether cached permit nonce matches current nonce and update it in case it doesnt

  const nonce = await eip2612PermitUtils.getTokenNonce(tokenAddress, owner)

  const request = new Promise<string>(async (resolve) => {
    const spender = GP_VAULT_RELAYER[chainId]
    const deadline = getDeadline()
    const value = MaxUint256.toString()

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

      resolve(permitHook)
    } catch (e) {
      return Promise.reject(e.message)
    }
  })

  pendingRequests[permitKey] = request

  return request
}
