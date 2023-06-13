import { useUpdateAtom, useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'

import { updateReceiptAtom, receiptAtom } from 'modules/ordersTable/state/orderReceiptAtom'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export function useCloseReceiptModal() {
  const updateReceiptState = useUpdateAtom(updateReceiptAtom)
  return useCallback(() => updateReceiptState({ order: null }), [updateReceiptState])
}

export function useSelectReceiptOrder(): (order: ParsedOrder) => void {
  const updateReceiptState = useUpdateAtom(updateReceiptAtom)
  return useCallback((order: ParsedOrder) => updateReceiptState({ order }), [updateReceiptState])
}

export function useSelectedOrder(): ParsedOrder | null {
  const { order } = useAtomValue(receiptAtom)

  return order
}
