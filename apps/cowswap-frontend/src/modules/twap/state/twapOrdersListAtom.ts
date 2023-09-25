import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { deepEqual } from '@cowprotocol/common-utils'
import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { cowSwapStore } from 'legacy/state'
import { deleteOrders } from 'legacy/state/orders/actions'

import { TWAP_FINAL_STATUSES } from '../const'
import { TwapOrderItem, TwapOrderStatus } from '../types'
import { updateTwapOrdersList } from '../utils/updateTwapOrdersList'

export type TwapOrdersList = { [key: string]: TwapOrderItem }

export const twapOrdersAtom = atomWithStorage<TwapOrdersList>('twap-orders-list:v1', {}, getJotaiIsolatedStorage())

export const twapOrdersListAtom = atom<TwapOrderItem[]>((get) => {
  const { account, chainId } = get(walletInfoAtom)

  if (!account || !chainId) return []

  const accountLowerCase = account.toLowerCase()

  const orders = Object.values(get(twapOrdersAtom))

  return orders
    .flat()
    .filter((order) => order.safeAddress.toLowerCase() === accountLowerCase && order.chainId === chainId)
})

export const updateTwapOrdersListAtom = atom(null, (get, set, nextState: TwapOrdersList) => {
  const currentState = get(twapOrdersAtom)
  const newState = updateTwapOrdersList(currentState, nextState)

  if (!deepEqual(currentState, newState)) {
    set(twapOrdersAtom, newState)
  }
})

export const addTwapOrderToListAtom = atom(null, (get, set, order: TwapOrderItem) => {
  const currentState = get(twapOrdersAtom)

  set(twapOrdersAtom, { ...currentState, [order.id]: order })
})

export const deleteTwapOrdersFromListAtom = atom(null, (get, set, ids: string[]) => {
  const { chainId } = get(walletInfoAtom)
  const currentState = get(twapOrdersAtom)

  ids.forEach((id) => {
    delete currentState[id]
  })

  cowSwapStore.dispatch(deleteOrders({ chainId, ids }))

  set(twapOrdersAtom, currentState)
})

export const setTwapOrderStatusAtom = atom(null, (get, set, orderId: string, status: TwapOrderStatus) => {
  const currentState = get(twapOrdersAtom)
  const currentOrder = currentState[orderId]

  if (TWAP_FINAL_STATUSES.includes(currentOrder.status)) return

  set(twapOrdersAtom, { ...currentState, [orderId]: { ...currentOrder, status } })
})
