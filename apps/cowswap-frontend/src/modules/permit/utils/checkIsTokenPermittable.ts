import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Web3Provider } from '@ethersproject/providers'

import { DAI_LIKE_PERMIT_TYPEHASH, Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

import { GP_VAULT_RELAYER, NATIVE_CURRENCY_BUY_ADDRESS } from 'legacy/constants'

import { buildDaiLikePermitCallData, buildEip2162PermitCallData } from './buildPermitCallData'
import { getPermitDeadline } from './getPermitDeadline'
import { Web3ProviderConnector } from './Web3ProviderConnector'

import { DEFAULT_PERMIT_VALUE, FAKE_SIGNER, PERMIT_GAS_LIMIT_MIN } from '../const'
import { EstimatePermitResult } from '../types'

const permitParams = {
  value: DEFAULT_PERMIT_VALUE,
  nonce: 0,
  deadline: getPermitDeadline(),
}

const daiLikePermitParams = {
  allowed: true,
  nonce: 0,
  expiry: getPermitDeadline(),
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
