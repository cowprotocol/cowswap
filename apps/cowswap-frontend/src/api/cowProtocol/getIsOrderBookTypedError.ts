import type { OrderBookApiError } from '@cowprotocol/cow-sdk'

import type { ApiErrorObject } from './errors/OperatorError'
import type { QuoteApiErrorObject } from './errors/QuoteError'

export type OrderBookTypedError = OrderBookApiError<ApiErrorObject>
export type QuoteApiTypedError = OrderBookApiError<QuoteApiErrorObject>

export function getIsOrderBookTypedError(err: unknown): err is OrderBookTypedError {
  const error = err as OrderBookTypedError

  if (!error?.body) return false

  return error.body.errorType !== undefined && error.body.description !== undefined
}

export function getIsQuoteApiTypedError(err: unknown): err is QuoteApiTypedError {
  const error = err as OrderBookTypedError

  if (!error?.body) return false

  return error.body.errorType !== undefined && error.body.description !== undefined
}
