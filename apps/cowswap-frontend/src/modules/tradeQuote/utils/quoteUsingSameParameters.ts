import { TradeParameters } from '@cowprotocol/cow-sdk'

import { Nullish } from 'types'

import { AppDataInfo } from 'modules/appData'

/**
 * Checks if the parameters for the current quote are correct
 *
 * Quotes are only valid for a given token-pair and amount. If any of these parameter change, the fee needs to be re-fetched
 */
export function quoteUsingSameParameters(
  currentParams: Nullish<TradeParameters>,
  nextParams: Nullish<TradeParameters>,
  currentAppData: AppDataInfo['doc'] | undefined,
  appData: AppDataInfo['doc'] | undefined,
): boolean {
  if (!currentParams || !nextParams) return false

  const hasSameAppData = compareAppDataWithoutQuoteData(currentAppData, appData)

  return (
    hasSameAppData &&
    currentParams.owner === nextParams.owner &&
    currentParams.kind === nextParams.kind &&
    currentParams.sellToken === nextParams.sellToken &&
    currentParams.buyToken === nextParams.buyToken &&
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
