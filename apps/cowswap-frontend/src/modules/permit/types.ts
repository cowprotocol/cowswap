import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { PermitHookData, PermitHookParams, PermitInfo } from '@cowprotocol/permit-utils'

import { AppDataInfo } from 'modules/appData'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export type IsTokenPermittableResult = PermitInfo | undefined

export type PermittableTokens = Record<SupportedChainId, Record<string, PermitInfo>>

export type AddPermitTokenParams = {
  chainId: SupportedChainId
  tokenAddress: string
  permitInfo: PermitInfo
}

export type GeneratePermitHookParams = Pick<PermitHookParams, 'inputToken' | 'permitInfo' | 'account'>

export type GeneratePermitHook = (params: GeneratePermitHookParams) => Promise<PermitHookData | undefined>

export type HandlePermitParams = Omit<GeneratePermitHookParams, 'permitInfo'> & {
  permitInfo: IsTokenPermittableResult
  appData: AppDataInfo
  generatePermitHook: GeneratePermitHook
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
}

export type StorePermitCacheParams = PermitCacheKeyParams & { hookData: PermitHookData }

export type GetPermitCacheParams = PermitCacheKeyParams

export type CheckHasValidPendingPermit = (order: ParsedOrder) => Promise<boolean | undefined>

export type OrdersPermitStatus = Record<string, boolean | undefined>
