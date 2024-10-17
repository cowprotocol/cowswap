import ms from 'ms.macro'

import { QuoteInformationObject } from 'legacy/state/price/reducer'
import { LegacyFeeQuoteParams } from 'legacy/state/price/types'

import { quoteUsingSameParameters } from './quoteUsingSameParameters'

const RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME = ms`30s` // Will renew the quote if there's less than 30 seconds left for the quote to expire
const WAITING_TIME_BETWEEN_EQUAL_REQUESTS = ms`5s` // Prevents from sending the same request to often (max, every 5s)

/**
 * Returns if the quote has been recently checked
 */
function wasQuoteCheckedRecently(lastQuoteCheck: number): boolean {
  return lastQuoteCheck + WAITING_TIME_BETWEEN_EQUAL_REQUESTS > Date.now()
}

/**
 * Returns true if the fee quote expires soon (in less than RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME milliseconds)
 */
function isExpiringSoon(quoteExpirationIsoDate: string, threshold: number): boolean {
  const feeExpirationDate = Date.parse(quoteExpirationIsoDate)
  return feeExpirationDate <= Date.now() + threshold
}

/**
 *  Decides if we need to refetch the fee information given the current parameters (selected by the user), and the current feeInfo (in the state)
 */
export function isRefetchQuoteRequired(
  isLoading: boolean,
  currentParams: LegacyFeeQuoteParams,
  quoteInformation?: QuoteInformationObject,
): boolean {
  // If there's no quote/fee information, we always re-fetch
  if (!quoteInformation) {
    return true
  }

  if (!quoteUsingSameParameters(currentParams, quoteInformation)) {
    // If the current parameters don't match the fee, the fee information is invalid and needs to be re-fetched
    return true
  }

  // The query params are the same, so we only ask for a new quote if:
  //  - If the quote was not queried recently
  //  - There's not another price query going on right now
  //  - The quote will expire soon
  if (wasQuoteCheckedRecently(quoteInformation.lastCheck)) {
    // Don't Re-fetch if it was queried recently
    return false
  } else if (isLoading) {
    // Don't Re-fetch if there's another quote going on with the same params
    // It's better to wait for the timeout or resolution. Also prevents an issue of refreshing too fast with slow APIs
    return false
  } else if (quoteInformation.fee) {
    // Re-fetch if the fee is expiring soon
    return isExpiringSoon(quoteInformation.fee.expirationDate, RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME)
  }

  return false
}
