import { MaxUint256 } from '@ethersproject/constants'

import { DAI_PERMIT_SELECTOR, Eip2612PermitUtils, EIP_2612_PERMIT_SELECTOR } from '@1inch/permit-signed-approvals-utils'

import { GP_VAULT_RELAYER } from 'legacy/constants'

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

    let callData
    try {
      if (permitInfo.type === 'eip-2612') {
        callData = (
          await eip2612PermitUtils.buildPermitCallData(
            {
              owner,
              spender,
              value: MaxUint256.toString(),
              nonce,
              deadline,
            },
            chainId as number,
            tokenName,
            tokenAddress
          )
        ).replace('0x', EIP_2612_PERMIT_SELECTOR)
      } else {
        callData = (
          await eip2612PermitUtils.buildDaiLikePermitCallData(
            {
              holder: owner,
              spender,
              allowed: true,
              value: MaxUint256.toString(),
              nonce,
              expiry: deadline,
            },
            chainId as number,
            tokenName,
            tokenAddress
          )
        ).replace('0x', DAI_PERMIT_SELECTOR)
      }

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
