import { atom } from 'jotai'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'
import { jotaiStore } from '@cowprotocol/core'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { observe } from 'jotai-effect'

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
 * Automatically resets to initial value when account/chainId changes.
 */
export const ordersLimitAtom = atom<OrdersLimitState>(DEFAULT_ORDERS_LIMIT_STATE)

// Reset ordersLimitAtom every time the network or the wallet address change (only while/when ordersLimitAtom is being
// observed):

const walletKeyAtom = atom((get) => {
  const { chainId, account } = get(walletInfoAtom)
  return account ? `${chainId}::${account.toLowerCase()}` : ''
})

ordersLimitAtom.onMount = () => {
  return observe((get, set) => {
    get(walletKeyAtom)
    set(ordersLimitAtom, DEFAULT_ORDERS_LIMIT_STATE)
  }, jotaiStore)
}
