import { MAX_VALID_TO_EPOCH } from '@cowprotocol/common-utils'

import ms from 'ms.macro'

import { getIsFastQuote } from './getIsFastQuote'

import { TradeQuoteState } from '../state/tradeQuoteAtom'

const MAX_EXPIRATION_TIME = ms`1min`

/**
 * Because local time can be different from the server time, we need to calculate time offset and take it into account
 *
 * expirationDate the timestamp when the quote is no longer valid (from API response)
 * deadlineParams the deadline parameters for the quote
 */
export function isQuoteExpired(state: TradeQuoteState): boolean | undefined {
  if (!state.quote || !state.localQuoteTimestamp || getIsFastQuote(state.fetchParams)) return undefined

  const { expiration } = state.quote.quoteResults.quoteResponse

  const timeOffset = getQuoteTimeOffset(state)

  if (!expiration || timeOffset === undefined) {
    return undefined
  }

  const quoteExpirationTime = new Date(expiration).getTime()
  const maxExpirationTime = new Date(state.localQuoteTimestamp * 1000).getTime() + MAX_EXPIRATION_TIME
  const expirationTime = Math.min(quoteExpirationTime, maxExpirationTime)

  const now = Date.now()
  const delta = (expirationTime - now) / 1000

  /**
   * The difference between the expiration time and the current time (including 5 sec threshold)
   */
  return delta + timeOffset < 0
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
