import { atom } from 'jotai'

import { parseRetryAfter } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { OrderBookApiError } from '@cowprotocol/cow-sdk'

import { captchaJwtAtom } from './captchaJwtAtom'

/** Timestamp (ms) until which quotes are paused after the order book answered 429. */
export const quoteRateLimitedUntilAtom = atom<number | null>(null)

export function getCaptchaToken(): string | undefined {
  return jotaiStore.get(captchaJwtAtom)?.token
}

export function isQuoteRateLimited(until: number | null): boolean {
  return until !== null && Date.now() < until
}

/** Pauses quotes until `Retry-After` when `error` is an order book 429, and tells whether it was one. */
export function pauseQuotesOnRateLimit(error: unknown, captchaTokenAtRequest: string | undefined): boolean {
  if (!(error instanceof OrderBookApiError) || error.response.status !== 429) return false

  // A 429 for a JWT replaced since the request started doesn't limit the new one.
  if (getCaptchaToken() === captchaTokenAtRequest) {
    // An overlapping 429 with a shorter Retry-After must not cut the pause short.
    const until = Date.now() + parseRetryAfter(error.response)
    jotaiStore.set(quoteRateLimitedUntilAtom, (current) => Math.max(current ?? 0, until))
  }

  return true
}
