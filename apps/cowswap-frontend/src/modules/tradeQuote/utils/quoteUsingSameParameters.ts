import { SupportedChainId, QuoteBridgeRequest, TradeParameters } from '@cowprotocol/cow-sdk'
import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getIsNativeToken } from '@cowprotocol/common-utils'

import { Nullish } from 'types'

import { AppDataInfo } from 'modules/appData'

/**
 * Checks if the parameters for the current quote are correct
 *
 * Quotes are only valid for a given token-pair and amount. If any of these parameter change, the fee needs to be re-fetched
 */
export function quoteUsingSameParameters(
  chainId: SupportedChainId,
  currentParams: Nullish<TradeParameters>,
  nextParams: Nullish<QuoteBridgeRequest>,
  currentAppData: AppDataInfo['doc'] | undefined,
  appData: AppDataInfo['doc'] | undefined,
): boolean {
  if (!currentParams || !nextParams) return false

  const hasSameAppData = compareAppDataWithoutQuoteData(currentAppData, appData)
  const isNativeToken = getIsNativeToken(chainId, nextParams.sellTokenAddress)
  const wrappedToken = WRAPPED_NATIVE_CURRENCIES[chainId]
  /**
   * Due to CoW Protocol design, we do
   */
  const nextSellToken = isNativeToken ? wrappedToken.address.toLowerCase() : nextParams.sellTokenAddress.toLowerCase()

  // TODO: compare tokens chainIds
  return (
    hasSameAppData &&
    currentParams.owner === nextParams.owner &&
    currentParams.kind === nextParams.kind &&
    currentParams.sellToken.toLowerCase() === nextSellToken &&
    currentParams.buyToken === nextParams.buyTokenAddress &&
    currentParams.amount === nextParams.amount &&
    currentParams.receiver === nextParams.receiver &&
    currentParams.validFor === nextParams.validFor
  )
}

/**
 * Compares appData without taking into account the `quote` metadata
 */
function compareAppDataWithoutQuoteData(a: AppDataInfo['doc'] | undefined, b: AppDataInfo['doc'] | undefined): boolean {
  if (a === b) return true

  if (!a || !b) {
    return a === b
  }

  return removeQuoteMetadata(a) === removeQuoteMetadata(b)
}

/**
 * If appData is set and is valid, remove `quote` metadata from it
 */
function removeQuoteMetadata(appData: AppDataInfo['doc']): string {
  const { metadata: fullMetadata, ...rest } = appData
  const { quote: _, ...metadata } = fullMetadata
  return JSON.stringify({ ...rest, metadata })
}
