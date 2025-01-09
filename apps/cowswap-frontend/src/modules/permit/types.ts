import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { PermitHookData, PermitHookParams, PermitInfo } from '@cowprotocol/permit-utils'
import { Currency } from '@uniswap/sdk-core'

import { AppDataInfo, TypedAppDataHooks } from 'modules/appData'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export type IsTokenPermittableResult = PermitInfo | undefined

export type AddPermitTokenParams = {
  chainId: SupportedChainId
  tokenAddress: string
  permitInfo: PermitInfo
}

export type GeneratePermitHookParams = Pick<PermitHookParams, 'inputToken' | 'permitInfo' | 'account'> & {
  customSpender?: string
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
}

export type StorePermitCacheParams = PermitCacheKeyParams & { hookData: PermitHookData }

export type GetPermitCacheParams = PermitCacheKeyParams

export type CheckHasValidPendingPermit = (order: ParsedOrder) => Promise<boolean | undefined>

export type OrdersPermitStatus = Record<string, boolean | undefined>

export type PermitCompatibleTokens = Record<string, boolean>
