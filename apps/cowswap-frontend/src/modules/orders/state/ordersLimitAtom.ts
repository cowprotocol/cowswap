import { atom } from 'jotai'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'
import { jotaiStore } from '@cowprotocol/core'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { observe } from 'jotai-effect'

export const DEFAULT_ORDERS_LIMIT: number = AMOUNT_OF_ORDERS_TO_FETCH

/**
 * Atom to track the current limit for fetching orders.
 * Starts at AMOUNT_OF_ORDERS_TO_FETCH (100) and increments by 100 up to MAXIMUM_ORDERS_TO_FETCH (1000).
 * Automatically resets to initial value when account/chainId changes.
 */
export const ordersLimitAtom = atom(DEFAULT_ORDERS_LIMIT)

// Reset ordersLimitAtom every time the network or the wallet address change (only while/when ordersLimitAtom is being
// observed):

const walletKeyAtom = atom((get) => {
  const { chainId, account } = get(walletInfoAtom)
  return account ? `${chainId}::${getAddressKey(account)}` : ''
})

ordersLimitAtom.onMount = () => {
  return observe((get, set) => {
    get(walletKeyAtom)
    set(ordersLimitAtom, DEFAULT_ORDERS_LIMIT)
  }, jotaiStore)
}
