import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { Command } from '@cowprotocol/types'

import { isPending } from 'common/hooks/useCategorizeRecentActivity'
import { useSetAlternativeOrder } from 'common/state/alternativeOrder'
import { getUiOrderType, UiOrderType } from 'utils/orderUtils/getUiOrderType'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { receiptAtom, updateReceiptAtom } from '../../state/orderReceiptAtom'

export function useCloseReceiptModal() {
  const updateReceiptState = useSetAtom(updateReceiptAtom)
  return useCallback(() => updateReceiptState({ order: null }), [updateReceiptState])
}

export function useSelectReceiptOrder(): (order: ParsedOrder) => void {
  const updateReceiptState = useSetAtom(updateReceiptAtom)
  return useCallback((order: ParsedOrder) => updateReceiptState({ order }), [updateReceiptState])
}

export function useSelectedOrder(): ParsedOrder | null {
  const { order } = useAtomValue(receiptAtom)

  return order
}

export function useGetShowRecreateModal(order: ParsedOrder | null): Command | null {
  const setOrderToRecreate = useSetAlternativeOrder()

  return useMemo(
    () =>
      !order || isPending(order) || getUiOrderType(order) !== UiOrderType.LIMIT
        ? null
        : () => setOrderToRecreate(order),
    [order, setOrderToRecreate]
  )
}
