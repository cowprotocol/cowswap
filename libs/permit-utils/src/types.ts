import type { cowAppDataLatestScheme } from '@cowprotocol/cow-sdk'
import type { JsonRpcProvider } from '@ethersproject/providers'

import type { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'

export type BuildDaiLikePermitCallDataParams = BasePermitCallDataParams & {
  callDataParams: Parameters<Eip2612PermitUtils['buildDaiLikePermitCallData']>
}

export type BuildEip2612PermitCallDataParams = BasePermitCallDataParams & {
  callDataParams: Parameters<Eip2612PermitUtils['buildPermitCallData']>
}

export type GetTokenPermitInfoParams = {
  spender: string
  tokenAddress: string
  chainId: number
  provider: JsonRpcProvider
  minGasLimit?: number | undefined
  amount?: bigint
}

export type GetTokenPermitIntoResult =
  // When it's a permittable token:
  | PermitInfo
  // When something failed:
  | FailedToIdentify

export type PermitHookData = cowAppDataLatestScheme.CoWHook

export type PermitHookParams = {
  inputToken: TokenInfo
  spender: string
  chainId: number
  permitInfo: PermitInfo
  provider: JsonRpcProvider
  eip2612Utils: Eip2612PermitUtils
  account?: string
  nonce?: number
  amount?: bigint
}

export type PermitInfo = {
  type: PermitType
  // TODO: make it not optional once token-lists is migrated
  name?: string
  version?: string | undefined // Some tokens have it different than `1`, and won't work without it
}

export type PermitType = 'dai-like' | 'eip-2612' | 'unsupported'
type BasePermitCallDataParams = {
  eip2612Utils: Eip2612PermitUtils
}
type FailedToIdentify = { error: string }

// Local TokenInfo definition to not depend on external libs just for this
type TokenInfo = {
  address: string
  // TODO: remove from token info
  name: string | undefined
}
