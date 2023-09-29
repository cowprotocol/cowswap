import { GP_VAULT_RELAYER, NATIVE_CURRENCY_BUY_ADDRESS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Web3Provider } from '@ethersproject/providers'

import { DAI_LIKE_PERMIT_TYPEHASH, Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

import { buildDaiLikePermitCallData, buildEip2162PermitCallData } from './buildPermitCallData'
import { getPermitDeadline } from './getPermitDeadline'
import { getPermitUtilsInstance } from './getPermitUtilsInstance'

import { DEFAULT_PERMIT_VALUE, PERMIT_GAS_LIMIT_MIN, PERMIT_SIGNER } from '../const'
import { CheckIsTokenPermittableParams, EstimatePermitResult } from '../types'

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

  try {
    const nonce = await eip2612PermitUtils.getTokenNonce(tokenAddress, owner)

    const data = await buildEip2162PermitCallData({
      eip2162Utils: eip2612PermitUtils,
      callDataParams: [
        {
          ...EIP_2162_PERMIT_PARAMS,
          owner,
          spender,
          nonce,
        },
        +chainId,
        tokenName,
        tokenAddress,
      ],
    })

    const estimatedGas = await provider.estimateGas({
      data,
      from: owner,
      to: tokenAddress,
    })

    const gasLimit = estimatedGas.toNumber()

    // Sometimes tokens implement the permit interface but don't actually implement it
    // This check filters out possible cases where that happened by excluding
    // gas limit which are bellow a minimum threshold
    return gasLimit > PERMIT_GAS_LIMIT_MIN[chainId]
      ? {
          type: 'eip-2612',
          gasLimit,
        }
      : false
  } catch (e) {
    try {
      return await estimateDaiLikeToken(tokenAddress, tokenName, chainId, owner, spender, provider, eip2612PermitUtils)
    } catch (e) {
      return { error: e.message || e.toString() }
    }
  }
}

// TODO: refactor and make DAI like tokens work
function estimateDaiLikeToken(
  tokenAddress: string,
  tokenName: string,
  chainId: SupportedChainId,
  walletAddress: string,
  spender: string,
  provider: Web3Provider,
  eip2612PermitUtils: Eip2612PermitUtils
): Promise<EstimatePermitResult> {
  return eip2612PermitUtils.getPermitTypeHash(tokenAddress).then((permitTypeHash) => {
    return permitTypeHash === DAI_LIKE_PERMIT_TYPEHASH
      ? eip2612PermitUtils
          .getTokenNonce(tokenAddress, walletAddress)
          .then((nonce) =>
            buildDaiLikePermitCallData({
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
          )
          .then((data) =>
            provider.estimateGas({
              data,
              from: walletAddress,
              to: tokenAddress,
            })
          )
          .then((res) => {
            const gasLimit = res.toNumber()

            return gasLimit > PERMIT_GAS_LIMIT_MIN[chainId]
              ? {
                  gasLimit,
                  type: 'dai-like',
                }
              : false
          })
      : false
  })
}
