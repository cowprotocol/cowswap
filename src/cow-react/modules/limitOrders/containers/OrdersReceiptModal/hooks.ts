import { useUpdateAtom } from 'jotai/utils'
import { updateReceiptAtom } from '@cow/modules/limitOrders/state/limitOrdersReceiptAtom'
import { Order } from '@src/custom/state/orders/actions'
import { useCallback } from 'react'

export function useCloseReceiptModal() {
  const updateReceiptState = useUpdateAtom(updateReceiptAtom)
  return useCallback(() => updateReceiptState({ selected: null }), [updateReceiptState])
}

export function useSelectReceiptOrder() {
  const updateReceiptState = useUpdateAtom(updateReceiptAtom)
  return useCallback((order: Order) => updateReceiptState({ selected: order }), [updateReceiptState])
}
