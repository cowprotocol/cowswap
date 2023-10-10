import { GP_VAULT_RELAYER, NATIVE_CURRENCY_BUY_ADDRESS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Web3Provider } from '@ethersproject/providers'

import { DAI_LIKE_PERMIT_TYPEHASH, Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

import { buildDaiLikePermitCallData, buildEip2162PermitCallData } from './buildPermitCallData'
import { getPermitDeadline } from './getPermitDeadline'
import { getPermitUtilsInstance } from './getPermitUtilsInstance'

import { DEFAULT_PERMIT_VALUE, PERMIT_GAS_LIMIT_MIN, PERMIT_SIGNER } from '../const'
import { CheckIsTokenPermittableParams, EstimatePermitResult, PermitType } from '../types'

const EIP_2162_PERMIT_PARAMS = {
  value: DEFAULT_PERMIT_VALUE,
  nonce: 0,
  deadline: getPermitDeadline(),
}

const DAI_LIKE_PERMIT_PARAMS = {
  allowed: true,
  nonce: 0,
  expiry: getPermitDeadline(),
}

const REQUESTS_CACHE: Record<string, Promise<EstimatePermitResult>> = {}

export async function checkIsTokenPermittable(params: CheckIsTokenPermittableParams): Promise<EstimatePermitResult> {
  const { tokenAddress, chainId } = params
  if (NATIVE_CURRENCY_BUY_ADDRESS.toLowerCase() === tokenAddress.toLowerCase()) {
    // We shouldn't call this for the native token, but just in case
    return false
  }

  const key = `${chainId}-${tokenAddress.toLowerCase()}`

  const cached = REQUESTS_CACHE[key]

  if (cached) {
    return cached
  }

  const request = actuallyCheckTokenIsPermittable(params)

  REQUESTS_CACHE[key] = request

  return request
}

async function actuallyCheckTokenIsPermittable(params: CheckIsTokenPermittableParams): Promise<EstimatePermitResult> {
  const { tokenAddress, tokenName, chainId, provider } = params

  const spender = GP_VAULT_RELAYER[chainId]

  const eip2612PermitUtils = getPermitUtilsInstance(chainId, provider)

  const owner = PERMIT_SIGNER.address

  let nonce: number

  try {
    nonce = await eip2612PermitUtils.getTokenNonce(tokenAddress, owner)
  } catch (e) {
    console.debug(`[checkTokenIsPermittable] Failed to get nonce for ${tokenAddress}`, e)

    return false
  }

  const baseParams: BaseParams = {
    chainId,
    eip2612PermitUtils,
    nonce,
    spender,
    tokenAddress,
    tokenName,
    walletAddress: owner,
  }

  try {
    // Try to estimate with eip-2612 first
    return await estimateTokenPermit({ ...baseParams, type: 'eip-2612', provider })
  } catch (e) {
    // Not eip-2612, try dai-like
    try {
      return await estimateTokenPermit({ ...baseParams, type: 'dai-like', provider })
    } catch (e) {
      // Not dai-like either, return error
      return { error: e.message || e.toString() }
    }
  }
}

type BaseParams = {
  tokenAddress: string
  tokenName: string
  chainId: SupportedChainId
  walletAddress: string
  spender: string
  eip2612PermitUtils: Eip2612PermitUtils
  nonce: number
}

type EstimateParams = BaseParams & {
  type: PermitType
  provider: Web3Provider
}

async function estimateTokenPermit(params: EstimateParams) {
  const { provider, chainId, walletAddress, tokenAddress, type } = params

  const getCallDataFn = type === 'eip-2612' ? getEip2612CallData : getDaiLikeCallData

  const data = await getCallDataFn(params)

  if (!data) {
    return false
  }

  const estimatedGas = await provider.estimateGas({
    data,
    from: walletAddress,
    to: tokenAddress,
  })

  const gasLimit = estimatedGas.toNumber()

  return gasLimit > PERMIT_GAS_LIMIT_MIN[chainId]
    ? {
        gasLimit,
        type,
      }
    : false
}

async function getEip2612CallData(params: BaseParams): Promise<string> {
  const { eip2612PermitUtils, walletAddress, spender, nonce, chainId, tokenName, tokenAddress } = params
  return buildEip2162PermitCallData({
    eip2162Utils: eip2612PermitUtils,
    callDataParams: [
      {
        ...EIP_2162_PERMIT_PARAMS,
        owner: walletAddress,
        spender,
        nonce,
      },
      +chainId,
      tokenName,
      tokenAddress,
    ],
  })
}

async function getDaiLikeCallData(params: BaseParams): Promise<string | false> {
  const { eip2612PermitUtils, tokenAddress, walletAddress, spender, nonce, chainId, tokenName } = params

  const permitTypeHash = await eip2612PermitUtils.getPermitTypeHash(tokenAddress)

  if (permitTypeHash === DAI_LIKE_PERMIT_TYPEHASH) {
    return buildDaiLikePermitCallData({
      eip2162Utils: eip2612PermitUtils,
      callDataParams: [
        {
          ...DAI_LIKE_PERMIT_PARAMS,
          holder: walletAddress,
          spender,
          nonce,
        },
        chainId as number,
        tokenName,
        tokenAddress,
      ],
    })
  }

  return false
}
