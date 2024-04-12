import { Nullish } from 'types'

const EXPIRATION_TIME_THRESHOLD = 5 // 5 seconds

interface QuoteExpirationInfo {
  validFor: Nullish<number>
  quoteValidTo: Nullish<number>
  quoteDate: Nullish<number>
  expirationDate: Nullish<string>
}

/**
 * Because local time can be different from the server time, we need to calculate time offset and take it into account
 */
export function isQuoteExpired({
  expirationDate,
  validFor,
  quoteValidTo,
  quoteDate,
}: QuoteExpirationInfo): boolean | undefined {
  if (!expirationDate || !validFor || !quoteValidTo || !quoteDate) {
    return undefined
  }

  const expectedValidTo = quoteDate + validFor
  const timeOffset = expectedValidTo - quoteValidTo

  const expirationTime = new Date(expirationDate).getTime()
  const delta = (expirationTime - Date.now()) / 1000

  return delta + timeOffset - EXPIRATION_TIME_THRESHOLD < 0
}
