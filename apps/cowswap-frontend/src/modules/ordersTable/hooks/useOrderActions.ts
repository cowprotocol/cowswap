import { useAtomValue, useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import type { Order } from 'legacy/state/orders/actions'

import { useCancelOrder } from 'common/hooks/useCancelOrder'
import { ordersToCancelAtom, updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { useSafeMemoObject } from 'common/hooks/useSafeMemo'
import { CancellableOrder } from 'common/utils/isOrderCancellable'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import {
  useGetAlternativeOrderModalContextCallback,
  useSelectReceiptOrder,
} from '../containers/OrdersReceiptModal/hooks'
import { useOrdersTableTokenApprove } from '../containers/OrdersTableWidget/hooks/useOrdersTableTokenApprove'
import { OrderActions } from '../types'

function toggleOrderInCancellationList(state: CancellableOrder[], order: CancellableOrder): CancellableOrder[] {
  const isOrderIncluded = state.find((item) => item.id === order.id)

  if (isOrderIncluded) {
    return state.filter((item) => item.id !== order.id)
  }

  return [...state, order]
}

export function useOrderActions(allOrders: Order[]): OrderActions {
  const cancelOrder = useCancelOrder()
  const ordersToCancel = useAtomValue(ordersToCancelAtom)
  const updateOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const selectReceiptOrder = useSelectReceiptOrder()
  const toggleOrdersForCancellation = useCallback(
    (orders: ParsedOrder[]) => {
      updateOrdersToCancel(orders)
    },
    [updateOrdersToCancel],
  )

  const toggleOrderForCancellation = useCallback(
    (order: ParsedOrder) => {
      updateOrdersToCancel(toggleOrderInCancellationList(ordersToCancel, order))
    },
    [ordersToCancel, updateOrdersToCancel],
  )

  const getShowCancellationModal = useCallback(
    (order: ParsedOrder) => {
      const rawOrder = allOrders.find((item) => item.id === order.id)

      return rawOrder ? cancelOrder(rawOrder) : null
    },
    [allOrders, cancelOrder],
  )

  const getAlternativeOrderModalContext = useGetAlternativeOrderModalContextCallback()

  const approveOrderToken = useOrdersTableTokenApprove()

  return useSafeMemoObject({
    getShowCancellationModal,
    getAlternativeOrderModalContext,
    selectReceiptOrder,
    toggleOrderForCancellation,
    toggleOrdersForCancellation,
    approveOrderToken,
  })
}
