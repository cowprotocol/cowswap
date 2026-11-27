import type { OrderBookApiError } from '@cowprotocol/cow-sdk'

const NOT_FOUND = 404

export function getIsOrderNotFoundError(err: unknown): boolean {
  const error = err as Partial<OrderBookApiError> | undefined

  return error?.response?.status === NOT_FOUND
}
