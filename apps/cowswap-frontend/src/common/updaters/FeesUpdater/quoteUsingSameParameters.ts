import { QuoteInformationObject } from 'legacy/state/price/reducer'
import { LegacyFeeQuoteParams } from 'legacy/state/price/types'

import { decodeAppData } from 'modules/appData'

/**
 * Checks if the parameters for the current quote are correct
 *
 * Quotes are only valid for a given token-pair and amount. If any of these parameter change, the fee needs to be re-fetched
 */
export function quoteUsingSameParameters(
  currentParams: LegacyFeeQuoteParams,
  quoteInfo: QuoteInformationObject,
): boolean {
  const {
    amount: currentAmount,
    sellToken: currentSellToken,
    buyToken: currentBuyToken,
    kind: currentKind,
    userAddress: currentUserAddress,
    receiver: currentReceiver,
    appData: currentAppData,
  } = currentParams
  const { amount, buyToken, sellToken, kind, userAddress, receiver, appData } = quoteInfo
  const hasSameReceiver = currentReceiver && receiver ? currentReceiver === receiver : true
  const hasSameAppData = compareAppDataWithoutQuoteData(appData, currentAppData)

  // cache the base quote params without quoteInfo user address to check
  const paramsWithoutAddress =
    sellToken === currentSellToken &&
    buyToken === currentBuyToken &&
    amount === currentAmount &&
    kind === currentKind &&
    hasSameAppData &&
    hasSameReceiver
  // 2 checks: if there's a quoteInfo user address (meaning quote was already calculated once) and one without
  // in case user is not connected
  return userAddress ? currentUserAddress === userAddress && paramsWithoutAddress : paramsWithoutAddress
}

/**
 * Compares appData without taking into account the `quote` metadata
 */
function compareAppDataWithoutQuoteData<T extends string | undefined>(a: T, b: T): boolean {
  if (a === b) {
    return true
  }
  const cleanedA = removeQuoteMetadata(a)
  const cleanedB = removeQuoteMetadata(b)

  return cleanedA === cleanedB
}

/**
 * If appData is set and is valid, remove `quote` metadata from it
 */
function removeQuoteMetadata(appData: string | undefined): string | undefined {
  if (!appData) {
    return
  }

  const decoded = decodeAppData(appData)

  if (!decoded) {
    return
  }

  const { metadata: fullMetadata, ...rest } = decoded
  const { quote: _, ...metadata } = fullMetadata
  return JSON.stringify({ ...rest, metadata })
}
