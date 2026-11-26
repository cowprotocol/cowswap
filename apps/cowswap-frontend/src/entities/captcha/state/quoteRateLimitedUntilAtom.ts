import { atom } from 'jotai'

import { parseRetryAfter } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { OrderBookApiError } from '@cowprotocol/cow-sdk'

/** Timestamp (ms) until which quotes are paused after the order book answered 429. */
export const quoteRateLimitedUntilAtom = atom<number | null>(null)

export function isQuoteRateLimited(until: number | null): boolean {
  return until !== null && Date.now() < until
}

/** Pauses quotes until `Retry-After` when `error` is an order book 429, and tells whether it was one. */
export function pauseQuotesOnRateLimit(error: unknown): boolean {
  if (!(error instanceof OrderBookApiError) || error.response.status !== 429) return false

  jotaiStore.set(quoteRateLimitedUntilAtom, Date.now() + parseRetryAfter(error.response))

  return true
}
