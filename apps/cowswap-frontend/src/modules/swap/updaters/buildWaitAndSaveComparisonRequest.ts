import type { SwapAdvancedSettings } from '@cowprotocol/cow-sdk'
import type { QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { QUOTE_SETTINGS } from 'tradingSdk/tradingSdk'

import { buildAppData, toBuildAppDataParams, type UseAppDataParams } from 'modules/appData'

export interface WaitAndSaveComparisonRequest {
  advancedSettings: SwapAdvancedSettings
  enableWaitForCow: boolean
  quoteParams: QuoteBridgeRequest
}

export async function buildWaitAndSaveComparisonRequest(params: {
  appDataParams: UseAppDataParams
  quoteParams: QuoteBridgeRequest
}): Promise<WaitAndSaveComparisonRequest | undefined> {
  const { enableWaitForCow } = params.appDataParams

  if (enableWaitForCow === undefined) return undefined

  const buildParams = toBuildAppDataParams(params.appDataParams)

  if (!buildParams) return undefined

  const appData = await buildAppData(buildParams)

  return {
    advancedSettings: { ...QUOTE_SETTINGS, appData: appData.doc },
    enableWaitForCow,
    quoteParams: params.quoteParams,
  }
}
