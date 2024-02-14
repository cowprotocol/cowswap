import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export const isRecreateOrderModalVisibleAtom = atom(false)
const orderToRecreateAtom = atom<Order | ParsedOrder | null>(null)

export function useIsRecreateOrderModalVisible() {
  return useAtomValue(isRecreateOrderModalVisibleAtom)
}

export function useUpdateRecreateOrderModalVisible() {
  return useSetAtom(isRecreateOrderModalVisibleAtom)
}

export function useGetOrderToRecreate() {
  return useAtomValue(orderToRecreateAtom)
}

export function useSetOrderToRecreate() {
  const setOrderToRecreate = useSetAtom(orderToRecreateAtom)
  const updateRecreateOrderModalVisible = useUpdateRecreateOrderModalVisible()

  return useCallback(
    (order: Order | ParsedOrder) => {
      // TODO: remove log
      console.log(`bug:useSetOrderToRecreate callback`, order)
      setOrderToRecreate(order)
      updateRecreateOrderModalVisible(true)
    },
    [setOrderToRecreate, updateRecreateOrderModalVisible]
  )
}
