import type { OrderBookApiError } from '@cowprotocol/cow-sdk'

const NOT_FOUND = 404

/**
 * True only when the order book answered "no such order". A transport failure or an outage rejects
 * the same call and must never be read as proof that an order does not exist.
 */
export function getIsOrderNotFoundError(err: unknown): boolean {
  const error = err as Partial<OrderBookApiError> | undefined

  return error?.response?.status === NOT_FOUND
}
