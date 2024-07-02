import { OrderBookApiError } from '@cowprotocol/cow-sdk'

import { ApiErrorObject } from './errors/OperatorError'

export type OrderBookTypedError = OrderBookApiError<ApiErrorObject>

export function getIsOrderBookTypedError(e: any): e is OrderBookTypedError {
  const error = e as OrderBookTypedError

  if (!error?.body) return false

  return error.body.errorType !== undefined && error.body.description !== undefined
}
