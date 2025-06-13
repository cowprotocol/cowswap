import type { JsonRpcProvider } from '@ethersproject/providers'

import { DAI_LIKE_PERMIT_TYPEHASH, Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

import { getPermitUtilsInstance } from './getPermitUtilsInstance'

import { DEFAULT_MIN_GAS_LIMIT, DEFAULT_PERMIT_VALUE, PERMIT_SIGNER } from '../const'
import { GetTokenPermitInfoParams, GetTokenPermitIntoResult, PermitInfo, PermitType } from '../types'
import { buildDaiLikePermitCallData, buildEip2612PermitCallData } from '../utils/buildPermitCallData'
import { Eip712Domain, getEip712Domain } from '../utils/getEip712Domain'
import { getPermitDeadline } from '../utils/getPermitDeadline'
import { getTokenName } from '../utils/getTokenName'
import { getTokenPermitVersion } from '../utils/getTokenPermitVersion'

const EIP_2612_PERMIT_PARAMS = {
  value: DEFAULT_PERMIT_VALUE,
  nonce: 0,
  deadline: getPermitDeadline(),
}

const DAI_LIKE_PERMIT_PARAMS = {
  allowed: true,
  nonce: 0,
  expiry: getPermitDeadline(),
}

const REQUESTS_CACHE: Record<string, Promise<GetTokenPermitIntoResult>> = {}

const UNSUPPORTED: PermitInfo = { type: 'unsupported' }

export async function getTokenPermitInfo(params: GetTokenPermitInfoParams): Promise<GetTokenPermitIntoResult> {
  const { tokenAddress, chainId } = params

  const key = `${chainId}-${tokenAddress.toLowerCase()}`

  const cached = REQUESTS_CACHE[key]

  if (cached) {
    return cached
  }

  const request = actuallyCheckTokenIsPermittable(params)

  REQUESTS_CACHE[key] = request

  return request
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
async function actuallyCheckTokenIsPermittable(params: GetTokenPermitInfoParams): Promise<GetTokenPermitIntoResult> {
  const { spender, tokenAddress, chainId, provider, minGasLimit } = params

  const eip2612PermitUtils = getPermitUtilsInstance(chainId, provider)

  const owner = PERMIT_SIGNER.address

  let domain: Eip712Domain | undefined = undefined
  // Try to get eip712domain, which contains most of the info we'll need here
  try {
    domain = await getEip712Domain(tokenAddress, chainId, provider)
  } catch {
    console.debug(`[checkTokenIsPermittable] Couldn't fetch eip712domain for token ${tokenAddress}`)
  }

  let tokenName = domain?.name

  try {
    if (!tokenName) {
      tokenName = await getTokenName(tokenAddress, chainId, provider)
    }
  } catch (e) {
    if (/ETIMEDOUT/.test(e) && !tokenName) {
      // Network issue or another temporary failure, return error
      return { error: `Failed to fetch token name from contract. RPC connection error` }
    }
    console.debug(
      `[checkTokenIsPermittable] Couldn't fetch token name from the contract for token ${tokenAddress}, using provided '${tokenName}'`,
      e,
    )
  }

  if (!tokenName) {
    const error = `Token name could not be determined for ${tokenAddress}`
    return { error }
  }

  let nonce: number

  try {
    nonce = await eip2612PermitUtils.getTokenNonce(tokenAddress, owner)
  } catch (e) {
    if (e === 'nonce not supported' || e.message === 'nonce is NaN') {
      console.debug(`[checkTokenIsPermittable] Not a permittable token ${tokenAddress} - ${tokenName}`, e?.message || e)
      // Here we know it's not supported, return unsupported
      // See https://github.com/1inch/permit-signed-approvals-utils/blob/b190197a45c3289867ee4e6da93f10dea51ef276/src/eip-2612-permit.utils.ts#L309
      // and https://github.com/1inch/permit-signed-approvals-utils/blob/b190197a45c3289867ee4e6da93f10dea51ef276/src/eip-2612-permit.utils.ts#L325
      return { ...UNSUPPORTED, name: tokenName }
    }
    console.debug(`[checkTokenIsPermittable] Failed to get nonce for ${tokenAddress} - ${tokenName}`, e)

    // Otherwise, it might have been a network issue or another temporary failure, return error
    return { error: e.message || e.toString() }
  }

  let version: string | undefined = domain?.version

  if (version === undefined) {
    // If the token does not outright fails when calling with the `version` value
    // returned by the contract, fetch it.

    try {
      // Required by USDC-mainnet as its version is `2`.
      // There might be other tokens that need this as well.
      version = await getTokenPermitVersion(tokenAddress, provider)
    } catch (e) {
      // Not a problem, we can (try to) continue without it, and will default to `1` (part of the 1inch lib)
      console.debug(`[checkTokenIsPermittable] Failed to get version for ${tokenAddress} - ${tokenName}`, e)
    }
  }

  const baseParams: BaseParams = {
    chainId,
    eip2612PermitUtils,
    nonce,
    spender,
    tokenAddress,
    tokenName,
    walletAddress: owner,
    version,
    minGasLimit,
  }

  try {
    // Try to estimate with eip-2612 first
    return await estimateTokenPermit({ ...baseParams, type: 'eip-2612', provider })
  } catch (e) {
    // Not eip-2612, try dai-like
    try {
      const isDaiLike = await isDaiLikeTypeHash(tokenAddress, eip2612PermitUtils)

      if (!isDaiLike) {
        // These might be supported, as they have nonces, but we don't know why the permit call fails
        // TODO: further investigate this kind of token
        // For now mark them as unsupported and don't check it again
        if (/invalid signature/.test(e) || e?.code === 'UNPREDICTABLE_GAS_LIMIT') {
          console.debug(
            `[checkTokenIsPermittable] Token ${tokenAddress} - ${tokenName} might be permittable, but it's not supported for now. Reason:`,
            e?.reason,
          )
          return { ...UNSUPPORTED, name: tokenName }
        }

        // Maybe a temporary failure
        console.debug(
          `[checkTokenIsPermittable] Failed to estimate eip-2612 permit for ${tokenAddress} - ${tokenName}`,
          e,
        )
        return { error: e.message || e.toString() }
      }

      return await estimateTokenPermit({ ...baseParams, type: 'dai-like', provider })
    } catch (e) {
      // Not dai-like either, return error
      console.debug(
        `[checkTokenIsPermittable] Failed to estimate dai-like permit for ${tokenAddress} - ${tokenName}`,
        e,
      )
      return { error: e.message || e.toString() }
    }
  }
}

type BaseParams = {
  tokenAddress: string
  tokenName: string
  chainId: number
  walletAddress: string
  spender: string
  eip2612PermitUtils: Eip2612PermitUtils
  nonce: number
  version: string | undefined
  minGasLimit?: number | undefined
}

type EstimateParams = BaseParams & {
  type: PermitType
  provider: JsonRpcProvider
}

async function estimateTokenPermit(params: EstimateParams): Promise<GetTokenPermitIntoResult> {
  const {
    provider,
    walletAddress,
    tokenAddress,
    tokenName,
    type,
    version,
    minGasLimit = DEFAULT_MIN_GAS_LIMIT,
  } = params

  const getCallDataFn = type === 'eip-2612' ? getEip2612CallData : getDaiLikeCallData

  const data = await getCallDataFn(params)

  if (!data) {
    return { ...UNSUPPORTED, name: tokenName }
  }

  const estimatedGas = await provider.estimateGas({
    data,
    from: walletAddress,
    to: tokenAddress,
  })

  const gasLimit = estimatedGas.toNumber()

  return gasLimit > minGasLimit
    ? {
        type,
        version,
        name: tokenName,
      }
    : { ...UNSUPPORTED, name: tokenName }
}

async function getEip2612CallData(params: BaseParams): Promise<string> {
  const { eip2612PermitUtils, walletAddress, spender, nonce, chainId, tokenName, tokenAddress, version } = params
  return buildEip2612PermitCallData({
    eip2612Utils: eip2612PermitUtils,
    callDataParams: [
      {
        ...EIP_2612_PERMIT_PARAMS,
        owner: walletAddress,
        spender,
        nonce,
      },
      +chainId,
      tokenName,
      tokenAddress,
      version,
    ],
  })
}

async function isDaiLikeTypeHash(tokenAddress: string, eip2612PermitUtils: Eip2612PermitUtils): Promise<boolean> {
  const permitTypeHash = await eip2612PermitUtils.getPermitTypeHash(tokenAddress)

  return permitTypeHash === DAI_LIKE_PERMIT_TYPEHASH
}

async function getDaiLikeCallData(params: BaseParams): Promise<string | false> {
  const { eip2612PermitUtils, tokenAddress, walletAddress, spender, nonce, chainId, tokenName, version } = params

  const permitTypeHash = await eip2612PermitUtils.getPermitTypeHash(tokenAddress)

  if (permitTypeHash === DAI_LIKE_PERMIT_TYPEHASH) {
    return buildDaiLikePermitCallData({
      eip2612Utils: eip2612PermitUtils,
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
        version,
      ],
    })
  }

  return false
}
