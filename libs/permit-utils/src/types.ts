import type { cowAppDataLatestScheme } from '@cowprotocol/cow-sdk'

import type { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'
import type { Address, PublicClient } from 'viem'
import type { Config } from 'wagmi'

export type PermitType = 'dai-like' | 'eip-2612' | 'unsupported'

export type PermitInfo = {
  type: PermitType
  // TODO: make it not optional once token-lists is migrated
  name?: string
  version?: string | undefined // Some tokens have it different than `1`, and won't work without it
}

// Local TokenInfo definition to not depend on external libs just for this
type TokenInfo = {
  address: Address
  // TODO: remove from token info
  name: string | undefined
}

export type PermitHookParams = {
  chainId: number
  config: Config
  eip2612Utils: Eip2612PermitUtils
  inputToken: TokenInfo
  permitInfo: PermitInfo
  spender: string
  account?: Address
  amount?: bigint
  nonce?: number
}

export type PermitHookData = cowAppDataLatestScheme.CoWHook

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
  chainId: number
  config: Config
  publicClient: PublicClient
  spender: string
  tokenAddress: Address
  amount?: bigint
  minGasLimit?: bigint | undefined
}
