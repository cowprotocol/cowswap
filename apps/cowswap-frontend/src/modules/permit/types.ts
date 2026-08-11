import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'
import { PermitHookData, PermitHookParams, PermitInfo } from '@cowprotocol/permit-utils'

import { AppDataInfo, TypedAppDataHooks } from 'modules/appData'

export type AddPermitTokenParams = {
  chainId: SupportedChainId
  tokenAddress: string
  permitInfo: PermitInfo
}

export type CachedPermitData = {
  hookData: PermitHookData
  nonce: number | undefined
}

export type GeneratePermitHook = (params: GeneratePermitHookParams) => Promise<PermitHookData | undefined>

export type GeneratePermitHookParams = Pick<PermitHookParams, 'inputToken' | 'permitInfo' | 'account' | 'amount'> & {
  customSpender?: string
  preSignCallback?: () => void | Promise<void>
  postSignCallback?: () => void
  /**
   * Full sell currency. When provided, a cache-miss fires the `ON_BEFORE_APPROVAL` widget hook
   * before requesting the permit signature. Omit for speculative/pre-generation callers that must
   * never prompt the host widget.
   */
  sellCurrency?: Currency
}

export type GetPermitCacheParams = PermitCacheKeyParams

export type HandlePermitParams = Omit<GeneratePermitHookParams, 'permitInfo' | 'inputToken'> & {
  permitInfo: IsTokenPermittableResult
  appData: AppDataInfo
  generatePermitHook: GeneratePermitHook
  inputToken: Currency
  typedHooks?: TypedAppDataHooks
}

export type IsTokenPermittableResult = PermitInfo | undefined

export type PermitCache = Record<string, string>

export type PermitCacheKeyParams = {
  chainId: SupportedChainId
  tokenAddress: string
  account: string | undefined
  nonce: number | undefined
  spender: string
  amount?: bigint
}

export type PermitCompatibleTokens = Record<string, boolean>

export type StorePermitCacheParams = PermitCacheKeyParams & { hookData: PermitHookData }
