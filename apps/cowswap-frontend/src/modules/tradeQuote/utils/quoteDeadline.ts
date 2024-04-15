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
 */
export function isQuoteExpired({ expirationDate, deadlineParams }: QuoteExpirationInfo): boolean | undefined {
  const timeOffset = getQuoteTimeOffset(deadlineParams)

  if (!expirationDate || timeOffset === undefined) {
    return undefined
  }

  const expirationTime = new Date(expirationDate).getTime()
  const delta = (expirationTime - Date.now()) / 1000

  return delta + timeOffset - EXPIRATION_TIME_THRESHOLD < 0
}

export function getQuoteTimeOffset({ validFor, quoteValidTo, quoteDate }: QuoteDeadlineParams): number | undefined {
  if (!validFor || !quoteValidTo || !quoteDate) return undefined

  const expectedValidTo = quoteDate + validFor

  return expectedValidTo - quoteValidTo
}

export function getOrderValidTo(deadline: number, { validFor, quoteValidTo, quoteDate }: QuoteDeadlineParams): number {
  const timeOffset = getQuoteTimeOffset({ validFor, quoteValidTo, quoteDate })

  if (timeOffset === undefined) return 0

  // Need the timestamp in seconds
  const now = Date.now() / 1000
  // Must be an integer
  const validTo = Math.floor(deadline + now - timeOffset)

  // Should not be greater than what the contract supports
  return Math.min(validTo, MAX_VALID_TO_EPOCH)
}
