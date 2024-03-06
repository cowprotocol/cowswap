import ms from 'ms.macro'
import { Nullish } from 'types'

const EXPIRATION_TIME_DELTA = ms`5s`

export function isQuoteExpired(expirationDate: Nullish<string>): boolean | undefined {
  if (!expirationDate) {
    return undefined
  }

  const expirationTime = new Date(expirationDate).getTime()

  return Date.now() > expirationTime - EXPIRATION_TIME_DELTA
}
