import { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'
import { latest } from '@cowprotocol/app-data'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Web3Provider } from '@ethersproject/providers'
import { Token } from '@uniswap/sdk-core'

export type PermitType = 'dai-like' | 'eip-2612'

export type SupportedPermitInfo = {
  type: PermitType
  version: string | undefined // Some tokens have it different than `1`, and won't work without it
}
type UnsupportedPermitInfo = false
export type PermitInfo = SupportedPermitInfo | UnsupportedPermitInfo

export type IsTokenPermittableResult = PermitInfo | undefined

export type PermitHookParams = {
  inputToken: Token
  spender: string
  chainId: SupportedChainId
  permitInfo: SupportedPermitInfo
  provider: Web3Provider
  eip2162Utils: Eip2612PermitUtils
  account?: string | undefined
  nonce?: number | undefined
}

export type PermitHookData = latest.CoWHook

type FailedToIdentify = { error: string }

export type EstimatePermitResult =
  // When it's a permittable token:
  | SupportedPermitInfo
  // When something failed:
  | FailedToIdentify
  // When it's not permittable:
  | UnsupportedPermitInfo

type BasePermitCallDataParams = {
  eip2162Utils: Eip2612PermitUtils
}
export type BuildEip2162PermitCallDataParams = BasePermitCallDataParams & {
  callDataParams: Parameters<Eip2612PermitUtils['buildPermitCallData']>
}
export type BuildDaiLikePermitCallDataParams = BasePermitCallDataParams & {
  callDataParams: Parameters<Eip2612PermitUtils['buildDaiLikePermitCallData']>
}

export type CheckIsTokenPermittableParams = {
  spender: string
  tokenAddress: string
  tokenName: string
  chainId: SupportedChainId
  provider: Web3Provider
}
