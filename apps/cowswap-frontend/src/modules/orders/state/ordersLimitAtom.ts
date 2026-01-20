import { atom } from 'jotai'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'

export interface OrdersLimitState {
  limit: number
  isLoading: boolean
}

export const DEFAULT_ORDERS_LIMIT_STATE: OrdersLimitState = {
  limit: AMOUNT_OF_ORDERS_TO_FETCH,
  isLoading: false,
}

/**
 * Atom to track the current limit for fetching orders.
 * Starts at AMOUNT_OF_ORDERS_TO_FETCH (100) and increments by 100 when "Load More" is clicked.
 * Should be reset to initial value when account/chainId changes.
 */
export const ordersLimitAtom = atom<OrdersLimitState>(DEFAULT_ORDERS_LIMIT_STATE)
