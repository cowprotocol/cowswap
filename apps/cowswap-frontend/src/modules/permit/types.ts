import { latest } from '@cowprotocol/app-data'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Web3Provider } from '@ethersproject/providers'
import { Token } from '@uniswap/sdk-core'

type permitType = 'dai-like' | 'eip-2612'

export type SupportedPermitInfo = {
  type: permitType
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

export type PermitHookData = latest.CoWHook

type FailedToIdentify = { error: string }

export type EstimatePermitResult =
  // When it's a permittable token:
  | SupportedPermitInfo
  // When something failed:
  | FailedToIdentify
  // When it's not permittable:
  | UnsupportedPermitInfo
