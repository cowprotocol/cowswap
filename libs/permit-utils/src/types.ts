import { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'
import { latest } from '@cowprotocol/app-data'
import { JsonRpcProvider } from '@ethersproject/providers'

export type PermitType = 'dai-like' | 'eip-2612'

export type SupportedPermitInfo = {
  type: PermitType
  version: string | undefined // Some tokens have it different than `1`, and won't work without it
}
type UnsupportedPermitInfo = false
export type PermitInfo = SupportedPermitInfo | UnsupportedPermitInfo

// Local TokenInfo definition to not depend on external libs just for this
type TokenInfo = {
  address: string
  name: string | undefined
}

export type PermitHookParams = {
  inputToken: TokenInfo
  spender: string
  chainId: number
  permitInfo: SupportedPermitInfo
  provider: JsonRpcProvider
  eip2162Utils: Eip2612PermitUtils
  account?: string | undefined
  nonce?: number | undefined
}

export type PermitHookData = latest.CoWHook

type FailedToIdentify = { error: string }

export type GetTokenPermitIntoResult =
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

export type GetTokenPermitInfoParams = {
  spender: string
  tokenAddress: string
  tokenName: string
  chainId: number
  provider: JsonRpcProvider
}
