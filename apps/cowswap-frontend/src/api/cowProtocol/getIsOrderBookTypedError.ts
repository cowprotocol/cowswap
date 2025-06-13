import { OrderBookApiError } from '@cowprotocol/cow-sdk'

import { ApiErrorObject } from './errors/OperatorError'

export type OrderBookTypedError = OrderBookApiError<ApiErrorObject>

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getIsOrderBookTypedError(e: any): e is OrderBookTypedError {
  const error = e as OrderBookTypedError

  if (!error?.body) return false

  return error.body.errorType !== undefined && error.body.description !== undefined
}
