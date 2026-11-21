import { MAX_VALID_TO_EPOCH } from '@cowprotocol/common-utils'

import ms from 'ms.macro'

import { getIsFastQuote } from './getIsFastQuote'

import { TradeQuoteState } from '../state/tradeQuoteAtom'

const MAX_EXPIRATION_TIME = ms`1min`

/** Max seconds added to Wait & Save `validTo` for UID uniqueness after soft cancel. */
const WAIT_AND_SAVE_VALID_TO_ENTROPY_SECONDS = 30

/**
 * Calculate the validTo timestamp for the order.
 * When `validFrom` is set (Wait for CoWs), expiration runs from the batch start
 * so the order does not expire during the wait: validTo = validFrom + deadline (+ wall-clock entropy).
 */
export function getOrderValidTo(deadline: number, state: TradeQuoteState, validFrom?: number): number {
  const timeOffset = getQuoteTimeOffset(state)

  if (timeOffset === undefined) return 0

  const now = Date.now() / 1000
  const serverNowSec = Math.floor(now - timeOffset)
  // Work around orderbook soft-cancel: identical Wait for CoWs params rebuild the same UID and
  // post as DuplicatedOrder. Mix wall-clock seconds into validTo so cancel+resubmit is unique.
  const waitAndSaveEntropy = serverNowSec % WAIT_AND_SAVE_VALID_TO_ENTROPY_SECONDS
  const validTo =
    typeof validFrom === 'number'
      ? Math.floor(validFrom + deadline + waitAndSaveEntropy)
      : Math.floor(deadline + serverNowSec)

  // Should not be greater than what the contract supports
  return Math.min(validTo, MAX_VALID_TO_EPOCH)
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

  // `expiration` is in server time, timeOffset converts it to local time
  const quoteExpirationTime = new Date(expiration).getTime() + timeOffset * 1000
  // Already in local time, so the offset must not be applied to it
  const maxExpirationTime = new Date(state.localQuoteTimestamp * 1000).getTime() + MAX_EXPIRATION_TIME
  const expirationTime = Math.min(quoteExpirationTime, maxExpirationTime)

  return expirationTime < Date.now()
}
