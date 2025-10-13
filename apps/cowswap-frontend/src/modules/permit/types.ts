import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { PermitHookData, PermitHookParams, PermitInfo } from '@cowprotocol/permit-utils'
import { Currency } from '@uniswap/sdk-core'

import { AppDataInfo, TypedAppDataHooks } from 'modules/appData'

export type IsTokenPermittableResult = PermitInfo | undefined

export type AddPermitTokenParams = {
  chainId: SupportedChainId
  tokenAddress: string
  permitInfo: PermitInfo
}

export type GeneratePermitHookParams = Pick<PermitHookParams, 'inputToken' | 'permitInfo' | 'account' | 'amount'> & {
  customSpender?: string
  preSignCallback?: () => void
  postSignCallback?: () => void
}

export type GeneratePermitHook = (params: GeneratePermitHookParams) => Promise<PermitHookData | undefined>

export type HandlePermitParams = Omit<GeneratePermitHookParams, 'permitInfo' | 'inputToken'> & {
  permitInfo: IsTokenPermittableResult
  appData: AppDataInfo
  generatePermitHook: GeneratePermitHook
  inputToken: Currency
  typedHooks?: TypedAppDataHooks
}

export type PermitCache = Record<string, string>

export type CachedPermitData = {
  hookData: PermitHookData
  nonce: number | undefined
}

export type PermitCacheKeyParams = {
  chainId: SupportedChainId
  tokenAddress: string
  account: string | undefined
  nonce: number | undefined
  spender: string
  amount?: bigint
}

export type StorePermitCacheParams = PermitCacheKeyParams & { hookData: PermitHookData }

export type GetPermitCacheParams = PermitCacheKeyParams

export type PermitCompatibleTokens = Record<string, boolean>
