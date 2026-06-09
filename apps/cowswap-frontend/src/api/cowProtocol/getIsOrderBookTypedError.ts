import type { OrderBookApiError } from '@cowprotocol/cow-sdk'

import type { ApiErrorObject } from './errors/OperatorError'
import type { QuoteApiErrorObject } from './errors/QuoteError'

export type OrderBookTypedError = OrderBookApiError<ApiErrorObject>
export type QuoteApiTypedError = OrderBookApiError<QuoteApiErrorObject>

export function getIsOrderBookTypedError(e: unknown): e is OrderBookTypedError {
  const error = e as OrderBookTypedError

  if (!error?.body) return false

  return error.body.errorType !== undefined && error.body.description !== undefined
}

export function getIsQuoteApiTypedError(e: unknown): e is QuoteApiTypedError {
  const error = e as OrderBookTypedError

  if (!error?.body) return false

  return error.body.errorType !== undefined && error.body.description !== undefined
}
