import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

import store from 'legacy/state'
import { deleteOrders } from 'legacy/state/orders/actions'

import { walletInfoAtom } from 'modules/wallet/api/state'

import { deepEqual } from 'utils/deepEqual'

import { TWAP_PENDING_STATUSES } from '../const'
import { TwapOrderItem, TwapOrderStatus } from '../types'
import { updateTwapOrdersList } from '../utils/updateTwapOrdersList'

export type TwapOrdersList = { [key: string]: TwapOrderItem }

export const twapOrdersAtom = atomWithStorage<TwapOrdersList>(
  'twap-orders-list:v1',
  {},
  createJSONStorage(() => localStorage)
)

export const twapOrdersListAtom = atom<TwapOrderItem[]>((get) => {
  const { account, chainId } = get(walletInfoAtom)

  if (!account || !chainId) return []

  const accountLowerCase = account.toLowerCase()

  const orders = Object.values(get(twapOrdersAtom))

  return orders
    .flat()
    .filter((order) => order.safeAddress.toLowerCase() === accountLowerCase && order.chainId === chainId)
})

export const openTwapOrdersAtom = atom<TwapOrderItem[]>((get) => {
  const allTwapOrders = get(twapOrdersListAtom)

  return allTwapOrders.filter((item) => TWAP_PENDING_STATUSES.includes(item.status))
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

  store.dispatch(deleteOrders({ chainId, ids }))

  set(twapOrdersAtom, currentState)
})

export const cancelTwapOrderAtom = atom(null, (get, set, orderId: string) => {
  const currentState = get(twapOrdersAtom)

  set(twapOrdersAtom, { ...currentState, [orderId]: { ...currentState[orderId], status: TwapOrderStatus.Cancelling } })
})
