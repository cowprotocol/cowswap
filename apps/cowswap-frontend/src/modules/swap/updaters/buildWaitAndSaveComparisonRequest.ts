import type { SwapAdvancedSettings } from '@cowprotocol/cow-sdk'
import type { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { QUOTE_SETTINGS } from 'tradingSdk/tradingSdk'

import { buildAppData, toBuildAppDataParams, type UseAppDataParams } from 'modules/appData'

export interface WaitAndSaveComparisonRequest {
  advancedSettings: SwapAdvancedSettings
  isOnQuote: boolean
  quoteParams: QuoteBridgeRequest
}

export async function buildWaitAndSaveComparisonRequest(params: {
  appDataParams: UseAppDataParams
  isOnQuote: boolean
  quoteParams: QuoteBridgeRequest
}): Promise<WaitAndSaveComparisonRequest | undefined> {
  const buildParams = toBuildAppDataParams({
    ...params.appDataParams,
    enableWaitForCow: params.isOnQuote,
  })

  if (!buildParams) return undefined

  const appData = await buildAppData(buildParams)

  return {
    advancedSettings: { ...QUOTE_SETTINGS, appData: appData.doc },
    isOnQuote: params.isOnQuote,
    quoteParams: params.quoteParams,
  }
}
