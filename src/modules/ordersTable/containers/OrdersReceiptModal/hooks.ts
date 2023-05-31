import { useUpdateAtom, useAtomValue } from 'jotai/utils'
import { useCallback, useMemo } from 'react'

import { UID } from '@cowprotocol/cow-sdk'

import { useOrdersTableList } from 'modules/ordersTable/containers/OrdersTableWidget/hooks/useOrdersTableList'
import { updateReceiptAtom, receiptAtom } from 'modules/ordersTable/state/orderReceiptAtom'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export function useCloseReceiptModal() {
  const updateReceiptState = useUpdateAtom(updateReceiptAtom)
  return useCallback(() => updateReceiptState({ orderId: null }), [updateReceiptState])
}

export function useSelectReceiptOrder(): (orderId: UID) => void {
  const updateReceiptState = useUpdateAtom(updateReceiptAtom)
  return useCallback((orderId: UID) => updateReceiptState({ orderId }), [updateReceiptState])
}

export function useSelectedOrder(): ParsedOrder | null {
  const { orderId } = useAtomValue(receiptAtom)
  const orders = useOrdersTableList()

  return useMemo(() => {
    if (!orderId || !orders) {
      return null
    }

    const allOrders = Object.values(orders).flat()

    return allOrders.find(({ id }) => id === orderId) || null
  }, [orderId, orders])
}
