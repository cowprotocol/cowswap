import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Erc20Abi } from '@cowswap/abis'
import { Web3Provider } from '@ethersproject/providers'
import { MaxUint256, Token } from '@uniswap/sdk-core'

import { daiPermitModelFields, eip2612PermitModelFields } from '@1inch/permit-signed-approvals-utils'
import { splitSignature } from 'ethers/lib/utils'

import { GP_VAULT_RELAYER } from 'legacy/constants'
import { getContract } from 'legacy/utils'

import { toKeccak256 } from '../modules/appData/utils/buildAppData'

export interface PermitHookParams {
  inputToken: Token
  provider: Web3Provider
  account: string
  chainId: SupportedChainId
  permitInfo: PermitInfo
}

export type PermitInfo = {
  type: 'dai' | 'permit'
  gasLimit: number
}

const cachePrefix = 'permitCache-'
const pendingRequests: { [permitKey: string]: Promise<string> | undefined } = {}

export async function generatePermitHook(params: PermitHookParams): Promise<string> {
  const { inputToken, chainId, account, provider, permitInfo } = params
  const permitKey = `${cachePrefix}${inputToken.address.toLowerCase()}-${account}-${chainId}`

  if (localStorage.getItem(permitKey)) return localStorage.getItem(permitKey)!
  if (pendingRequests[permitKey]) return pendingRequests[permitKey]!

  const request = new Promise<string>(async (resolve) => {
    const sellTokenContract = getContract(inputToken.address, Erc20Abi, provider, account)

    const nonce = (await sellTokenContract?.nonces(account))?.toString() || '0'

    const generatePermitHookData = permitInfo.type === 'dai' ? generateDaiPermitData : generatePermitPermitData

    const permitHookData = await generatePermitHookData({ ...params, nonce })

    const permitHook = JSON.stringify({
      backend: {
        hooks: {
          pre: [permitHookData],
          post: [],
        },
      },
    })

    const permitHookHash = toKeccak256(permitHook)
    console.log('permitHook', { permitHookHash, permitHook })
    localStorage.setItem(permitKey, permitHook)

    resolve(permitHook)
  })

  pendingRequests[permitKey] = request

  return request
}

type GeneratePermitDataParams = PermitHookParams & { nonce: string }

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
    deadline: MaxUint256.toString(),
  }
  const permitSignature = splitSignature(
    await provider.getSigner()._signTypedData(
      {
        name: inputToken.name,
        chainId: inputToken.chainId,
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
    deadline: MaxUint256.toString(),
  }
  const permitSignature = splitSignature(
    await provider.getSigner()._signTypedData(
      {
        name: inputToken.name,
        chainId: inputToken.chainId,
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
