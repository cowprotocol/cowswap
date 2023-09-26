import { latest } from '@cowprotocol/app-data'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Web3Provider } from '@ethersproject/providers'
import { Token } from '@uniswap/sdk-core'

import { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

import { AppDataInfo } from 'modules/appData'

export type PermitType = 'dai-like' | 'eip-2612'

export type SupportedPermitInfo = {
  type: PermitType
  gasLimit: number
}
type UnsupportedPermitInfo = false
export type PermitInfo = SupportedPermitInfo | UnsupportedPermitInfo

export type PermittableTokens = Record<SupportedChainId, Record<string, PermitInfo>>

export type IsTokenPermittableResult = PermitInfo | undefined

export type AddPermitTokenParams = {
  chainId: SupportedChainId
  tokenAddress: string
  permitInfo: PermitInfo
}

export type PermitHookParams = {
  inputToken: Token
  chainId: SupportedChainId
  permitInfo: SupportedPermitInfo
  provider: Web3Provider
  account?: string
}

export type HandlePermitParams = Omit<PermitHookParams, 'permitInfo'> & {
  permitInfo: IsTokenPermittableResult
  appData: AppDataInfo
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
  tokenAddress: string
  tokenName: string
  chainId: SupportedChainId
  provider: Web3Provider
}
