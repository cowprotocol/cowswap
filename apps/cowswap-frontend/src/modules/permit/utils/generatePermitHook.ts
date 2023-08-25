import { Erc20Abi } from '@cowswap/abis'
import { MaxUint256 } from '@ethersproject/constants'

import {
  daiPermitModelFields,
  eip2612PermitModelFields,
  Eip2612PermitUtils,
} from '@1inch/permit-signed-approvals-utils'
import { splitSignature } from 'ethers/lib/utils'

import { GP_VAULT_RELAYER } from 'legacy/constants'
import { getContract } from 'legacy/utils'

import { Web3ProviderConnector } from './Web3ProviderConnector'

import { FAKE_SIGNER } from '../const'
import { OrderPermitHookParams, QuotePermitHookParams } from '../types'

const cachePrefix = 'permitCache-'
const pendingRequests: { [permitKey: string]: Promise<string> | undefined } = {}

const FIVE_YEARS_IN_SECONDS = 5 * 365 * 24 * 60 * 60

function getDeadline() {
  return Math.ceil(Date.now() / 1000) + FIVE_YEARS_IN_SECONDS
}

export async function generateQuotePermitHook(params: QuotePermitHookParams): Promise<string> {
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

    console.log('bug--generateQuotePermitHook--will start', { owner, spender, nonce, chainId, tokenName, tokenAddress })

    let callData
    try {
      if (permitInfo.type === 'permit') {
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
        ).replace('0x', '0xd505accf')
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
        ).replace('0x', '0x8fcbaf0c')
      }

      const permitHookData = {
        target: tokenAddress,
        callData,
        gasLimit: permitInfo.gasLimit.toString(),
      }

      const permitHook = JSON.stringify(permitHookData)

      console.log('bug--generateQuotePermitHook--done', { permitHook })
      localStorage.setItem(permitKey, permitHook)

      resolve(permitHook)
    } catch (e) {
      console.error(`bug--generateQuotePermitHook--error`, e)
      return Promise.reject(e.message)
    }
  })

  pendingRequests[permitKey] = request

  return request
}

export async function generatePermitHook(params: OrderPermitHookParams): Promise<string> {
  const { inputToken, chainId, account, provider, permitInfo } = params
  const permitKey = `${cachePrefix}${inputToken.address.toLowerCase()}-${account}-${chainId}`

  if (localStorage.getItem(permitKey)) return localStorage.getItem(permitKey)!
  if (pendingRequests[permitKey]) return pendingRequests[permitKey]!

  const request = new Promise<string>(async (resolve) => {
    const sellTokenContract = getContract(inputToken.address, Erc20Abi, provider, account)

    const nonce = (await sellTokenContract?.nonces(account))?.toString() || '0'

    const generatePermitHookData = permitInfo.type === 'dai' ? generateDaiPermitData : generatePermitPermitData

    const permitHookData = await generatePermitHookData({ ...params, nonce })

    const permitHook = JSON.stringify(permitHookData)

    console.log('permitHook', { permitHook })
    localStorage.setItem(permitKey, permitHook)

    resolve(permitHook)
  })

  pendingRequests[permitKey] = request

  return request
}

type GeneratePermitDataParams = OrderPermitHookParams & { nonce: string }

async function generatePermitPermitData(params: GeneratePermitDataParams) {
  const {
    inputToken,
    chainId,
    account,
    provider,
    nonce,
    permitInfo: { gasLimit },
  } = params

  // TODO: use https://github.com/1inch/permit-signed-approvals-utils/blob/master/src/eip-2612-permit.utils.ts#L37
  // to handle this part
  const sellTokenContract = getContract(inputToken.address, Erc20Abi, provider, account)

  const permit = {
    owner: account,
    spender: GP_VAULT_RELAYER[chainId],
    value: MaxUint256.toString(),
    nonce,
    deadline: getDeadline(),
  }
  const permitSignature = splitSignature(
    await provider.getSigner()._signTypedData(
      {
        name: inputToken.name,
        chainId,
        verifyingContract: inputToken.address,
      },
      {
        Permit: eip2612PermitModelFields,
      },
      permit
    )
  )

  const permitParams = [
    permit.owner,
    permit.spender,
    permit.value,
    permit.deadline,
    permitSignature.v,
    permitSignature.r,
    permitSignature.s,
  ]

  return {
    target: inputToken.address,
    callData: sellTokenContract.interface.encodeFunctionData('permit', permitParams as any),
    gasLimit: gasLimit.toString(),
  }
}

async function generateDaiPermitData(params: GeneratePermitDataParams) {
  const {
    inputToken,
    chainId,
    account,
    provider,
    nonce,
    permitInfo: { gasLimit },
  } = params

  // TODO: use https://github.com/1inch/permit-signed-approvals-utils/blob/master/src/eip-2612-permit.utils.ts#L37
  // to handle this part
  const sellTokenContract = getContract(inputToken.address, Erc20Abi, provider, account)

  const permit = {
    holder: account,
    allowed: true,
    spender: GP_VAULT_RELAYER[chainId],
    value: MaxUint256.toString(),
    nonce,
    deadline: getDeadline(),
  }
  const permitSignature = splitSignature(
    await provider.getSigner()._signTypedData(
      {
        name: inputToken.name,
        chainId,
        verifyingContract: inputToken.address,
      },
      {
        Permit: daiPermitModelFields,
      },
      permit
    )
  )

  const permitParams = [
    permit.holder,
    permit.spender,
    permit.value,
    permit.deadline,
    permitSignature.v,
    permitSignature.r,
    permitSignature.s,
  ]

  return {
    target: inputToken.address,
    callData: sellTokenContract.interface.encodeFunctionData('permit', permitParams as any),
    gasLimit: gasLimit.toString(),
  }
}
