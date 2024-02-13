import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { RecreateOrderModal as Pure } from 'common/pure/RecreateOrderModal'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

// TODO: move state out
const isRecreateOrderModalVisibleAtom = atom(false)
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
      console.log(`bug:useSetOrderToRecreate callback`, order)
      setOrderToRecreate(order)
      updateRecreateOrderModalVisible(true)
    },
    [setOrderToRecreate, updateRecreateOrderModalVisible]
  )
}

export function RecreateOrderModal() {
  const isRecreateOrderModalVisible = useIsRecreateOrderModalVisible()
  const orderToRecreate = useGetOrderToRecreate()
  const updateRecreateOrderModalVisible = useUpdateRecreateOrderModalVisible()

  const onDismiss = useCallback(() => updateRecreateOrderModalVisible(false), [updateRecreateOrderModalVisible])

  if (!isRecreateOrderModalVisible) {
    return null
  }

  // TODO: use TradeWidget? LimitOrderWidget?
  return <Pure onDismiss={onDismiss}>{orderToRecreate?.id}</Pure>
}
