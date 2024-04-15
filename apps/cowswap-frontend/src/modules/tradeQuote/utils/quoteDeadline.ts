import { MAX_VALID_TO_EPOCH } from '@cowprotocol/common-utils'

import { Nullish } from 'types'

const EXPIRATION_TIME_THRESHOLD = 5 // 5 seconds

export interface QuoteDeadlineParams {
  validFor: Nullish<number>
  quoteValidTo: Nullish<number>
  quoteDate: Nullish<number>
}

interface QuoteExpirationInfo {
  expirationDate: Nullish<string>
  deadlineParams: QuoteDeadlineParams
}

/**
 * Because local time can be different from the server time, we need to calculate time offset and take it into account
 *
 * @param expirationDate the timestamp when the quote is no longer valid (from API response)
 * @param deadlineParams the deadline parameters for the quote
 */
export function isQuoteExpired({ expirationDate, deadlineParams }: QuoteExpirationInfo): boolean | undefined {
  const timeOffset = getQuoteTimeOffset(deadlineParams)

  if (!expirationDate || timeOffset === undefined) {
    return undefined
  }

  const expirationTime = new Date(expirationDate).getTime()
  const delta = (expirationTime - Date.now()) / 1000

  /**
   * The difference between the expiration time and the current time (including 5 sec threshold)
   */
  return delta + timeOffset - EXPIRATION_TIME_THRESHOLD < 0
}

/**
 * Calculate the time offset between the expected validTo and the actual quote validTo
 * @param validFor duration of the quote
 * @param quoteValidTo the timestamp when the quote is no longer valid (from API response)
 * @param quoteDate the timestamp when the quote was created
 */
export function getQuoteTimeOffset({ validFor, quoteValidTo, quoteDate }: QuoteDeadlineParams): number | undefined {
  if (!validFor || !quoteValidTo || !quoteDate) return undefined

  const expectedValidTo = quoteDate + validFor

  return expectedValidTo - quoteValidTo
}

/**
 * Calculate the validTo timestamp for the order
 */
export function getOrderValidTo(deadline: number, quoteDeadlineParams: QuoteDeadlineParams): number {
  const timeOffset = getQuoteTimeOffset(quoteDeadlineParams)

  if (timeOffset === undefined) return 0

  const now = Date.now() / 1000
  const validTo = Math.floor(deadline + now - timeOffset)

  // Should not be greater than what the contract supports
  return Math.min(validTo, MAX_VALID_TO_EPOCH)
}
