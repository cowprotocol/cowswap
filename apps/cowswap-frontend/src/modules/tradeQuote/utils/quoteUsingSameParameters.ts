import { Nullish } from 'types'

import { decodeAppData } from 'modules/appData'

import { FeeQuoteParams } from 'common/types'

/**
 * Checks if the parameters for the current quote are correct
 *
 * Quotes are only valid for a given token-pair and amount. If any of these parameter change, the fee needs to be re-fetched
 */
export function quoteUsingSameParameters(
  currentParams: Nullish<FeeQuoteParams>,
  nextParams: Nullish<FeeQuoteParams>,
): boolean {
  if (!currentParams || !nextParams) return false

  const hasSameAppData = compareAppDataWithoutQuoteData(currentParams.appData, nextParams.appData)

  return (
    hasSameAppData &&
    currentParams.sellToken === nextParams.sellToken &&
    currentParams.buyToken === nextParams.buyToken &&
    currentParams.kind === nextParams.kind &&
    currentParams.amount === nextParams.amount &&
    currentParams.userAddress === nextParams.userAddress &&
    currentParams.receiver === nextParams.receiver &&
    currentParams.validFor === nextParams.validFor &&
    currentParams.fromDecimals === nextParams.fromDecimals &&
    currentParams.toDecimals === nextParams.toDecimals &&
    currentParams.isEthFlow === nextParams.isEthFlow &&
    currentParams.chainId === nextParams.chainId
  )
}

/**
 * Compares appData without taking into account the `quote` metadata
 */
function compareAppDataWithoutQuoteData<T extends string | undefined>(a: T, b: T): boolean {
  if (a === b) return true

  return removeQuoteMetadata(a) === removeQuoteMetadata(b)
}

/**
 * If appData is set and is valid, remove `quote` metadata from it
 */
function removeQuoteMetadata(appData: string | undefined): string | undefined {
  if (!appData) return

  const decoded = decodeAppData(appData)

  if (!decoded) return

  const { metadata: fullMetadata, ...rest } = decoded
  const { quote: _, ...metadata } = fullMetadata
  return JSON.stringify({ ...rest, metadata })
}
