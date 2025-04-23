import { MAX_VALID_TO_EPOCH } from '@cowprotocol/common-utils'

import { TradeQuoteState } from '../state/tradeQuoteAtom'

const EXPIRATION_TIME_THRESHOLD = 5 // 5 seconds

/**
 * Because local time can be different from the server time, we need to calculate time offset and take it into account
 *
 * expirationDate the timestamp when the quote is no longer valid (from API response)
 * deadlineParams the deadline parameters for the quote
 */
export function isQuoteExpired(state: TradeQuoteState): boolean | undefined {
  if (!state.quote) return undefined

  const { expiration } = state.quote.quoteResults.quoteResponse

  const timeOffset = getQuoteTimeOffset(state)

  if (!expiration || timeOffset === undefined) {
    return undefined
  }

  const expirationTime = new Date(expiration).getTime()
  const delta = (expirationTime - Date.now()) / 1000

  /**
   * The difference between the expiration time and the current time (including 5 sec threshold)
   */
  return delta + timeOffset - EXPIRATION_TIME_THRESHOLD < 0
}

/**
 * Calculate the time offset between the expected validTo and the actual quote validTo
 * validFor duration of the quote
 * quoteValidTo the timestamp when the quote is no longer valid (from API response)
 * localQuoteTimestamp the timestamp when the quote was created
 */
export function getQuoteTimeOffset(state: TradeQuoteState): number | undefined {
  const validFor = state.quote?.quoteResults.tradeParameters.validFor
  const quoteValidTo = state.quote?.quoteResults.quoteResponse.quote.validTo
  const localQuoteTimestamp = state.localQuoteTimestamp

  if (!validFor || !quoteValidTo || !localQuoteTimestamp) return undefined

  const expectedValidTo = localQuoteTimestamp + validFor

  return expectedValidTo - quoteValidTo
}

/**
 * Calculate the validTo timestamp for the order
 */
export function getOrderValidTo(deadline: number, state: TradeQuoteState): number {
  const timeOffset = getQuoteTimeOffset(state)

  if (timeOffset === undefined) return 0

  const now = Date.now() / 1000
  const validTo = Math.floor(deadline + now - timeOffset)

  // Should not be greater than what the contract supports
  return Math.min(validTo, MAX_VALID_TO_EPOCH)
}
