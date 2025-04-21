import { latest } from '@cowprotocol/app-data'
import { JsonRpcProvider } from '@ethersproject/providers'

import { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

export type PermitType = 'dai-like' | 'eip-2612' | 'unsupported'

export type PermitInfo = {
  type: PermitType
  // TODO: make it not optional once token-lists is migrated
  name?: string
  version?: string | undefined // Some tokens have it different than `1`, and won't work without it
}

// Local TokenInfo definition to not depend on external libs just for this
type TokenInfo = {
  address: string
  // TODO: remove from token info
  name: string | undefined
}

export type PermitHookParams = {
  inputToken: TokenInfo
  spender: string
  chainId: number
  permitInfo: PermitInfo
  provider: JsonRpcProvider
  eip2612Utils: Eip2612PermitUtils
  account?: string | undefined
  nonce?: number | undefined
}

export type PermitHookData = latest.CoWHook

type FailedToIdentify = { error: string }

export type GetTokenPermitIntoResult =
  // When it's a permittable token:
  | PermitInfo
  // When something failed:
  | FailedToIdentify

type BasePermitCallDataParams = {
  eip2612Utils: Eip2612PermitUtils
}
export type BuildEip2612PermitCallDataParams = BasePermitCallDataParams & {
  callDataParams: Parameters<Eip2612PermitUtils['buildPermitCallData']>
}
export type BuildDaiLikePermitCallDataParams = BasePermitCallDataParams & {
  callDataParams: Parameters<Eip2612PermitUtils['buildDaiLikePermitCallData']>
}

export type GetTokenPermitInfoParams = {
  spender: string
  tokenAddress: string
  chainId: number
  provider: JsonRpcProvider
  minGasLimit?: number | undefined
}
