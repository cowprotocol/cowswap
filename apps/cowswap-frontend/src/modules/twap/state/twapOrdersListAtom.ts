import { atom } from 'jotai'

import { deepEqual } from '@cowprotocol/common-utils'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { eoaTwapOrdersAtom, twapOrdersAtom, twapOrdersListAtom, TwapOrdersList } from 'entities/twap'

import { cowSwapStore } from 'legacy/state'
import { deleteOrders } from 'legacy/state/orders/actions'

import { TWAP_FINAL_STATUSES } from '../const'
import { TwapOrderItem, TwapOrderStatus } from '../types'
import { triggerTwapAppziSurvey } from '../utils/triggerTwapAppziSurvey.utils'
import { updateTwapOrdersList } from '../utils/updateTwapOrdersList'

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

  if (!currentState[order.id] && order.status === TwapOrderStatus.Pending) {
    const orders = get(twapOrdersListAtom)
    const createdOrder = orders.find(({ id, hash }) => id === order.id || hash === order.id)

    if (createdOrder) triggerTwapAppziSurvey(createdOrder, { created: true }, orders)
  }
})

export const deleteTwapOrdersFromListAtom = atom(null, (get, set, ids: string[]) => {
  const { chainId } = get(walletInfoAtom)
  const currentState = get(twapOrdersAtom)

  if (ids.length === 0) return

  const nextState = { ...currentState }
  ids.forEach((id) => {
    delete nextState[id]
  })

  cowSwapStore.dispatch(deleteOrders({ chainId, ids }))

  set(twapOrdersAtom, nextState)
})

export const setTwapOrderStatusAtom = atom(null, (get, set, orderId: string, status: TwapOrderStatus) => {
  const currentEoaState = get(eoaTwapOrdersAtom)
  const currentEoaOrder = currentEoaState[orderId]
  const currentState = get(twapOrdersAtom)
  const cachedOrderId = currentEoaOrder?.hash ?? orderId
  const currentOrder = currentState[cachedOrderId]

  if (currentOrder && !TWAP_FINAL_STATUSES.includes(currentOrder.status)) {
    set(twapOrdersAtom, { ...currentState, [cachedOrderId]: { ...currentOrder, status } })
  }

  if (currentEoaOrder && !TWAP_FINAL_STATUSES.includes(currentEoaOrder.status)) {
    set(eoaTwapOrdersAtom, { ...currentEoaState, [orderId]: { ...currentEoaOrder, status } })
  }
})
