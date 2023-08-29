import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Web3Provider } from '@ethersproject/providers'

import { DAI_LIKE_PERMIT_TYPEHASH, Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

import { GP_VAULT_RELAYER, NATIVE_CURRENCY_BUY_ADDRESS } from 'legacy/constants'

import { buildDaiLikePermitCallData, buildEip2162PermitCallData } from './buildPermitCallData'
import { Web3ProviderConnector } from './Web3ProviderConnector'

import { FAKE_SIGNER } from '../const'
import { EstimatePermitResult } from '../types'

const permitGasLimitMin: Record<SupportedChainId, number> = {
  1: 55_000,
  100: 55_000,
  5: 55_000,
}

const permitParams = {
  value: '985090000000000000',
  nonce: 0,
  deadline: Math.ceil(Date.now() / 1000) + 50_000,
}

const daiLikePermitParams = {
  allowed: true,
  nonce: 0,
  expiry: Math.ceil(Date.now() / 1000) + 50_000,
}

export async function checkIsTokenPermittable(
  tokenAddress: string,
  tokenName: string,
  chainId: SupportedChainId,
  provider: Web3Provider
): Promise<EstimatePermitResult> {
  if (NATIVE_CURRENCY_BUY_ADDRESS.toLowerCase() === tokenAddress.toLowerCase()) {
    // We shouldn't call this for the native token, but just in case
    return false
  }

  const spender = GP_VAULT_RELAYER[chainId]

  const web3ProviderConnector = new Web3ProviderConnector(provider, FAKE_SIGNER)
  const eip2612PermitUtils = new Eip2612PermitUtils(web3ProviderConnector)

  const owner = FAKE_SIGNER.address

  try {
    const nonce = await eip2612PermitUtils.getTokenNonce(tokenAddress, owner)

    const data = await buildEip2162PermitCallData({
      eip2162Utils: eip2612PermitUtils,
      callDataParams: [
        {
          ...permitParams,
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
    return gasLimit > permitGasLimitMin[chainId]
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
                  ...daiLikePermitParams,
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

            return gasLimit > permitGasLimitMin[chainId]
              ? {
                  gasLimit,
                  type: 'dai-like',
                }
              : false
          })
      : false
  })
}
