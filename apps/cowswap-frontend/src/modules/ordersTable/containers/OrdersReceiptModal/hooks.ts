import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { Command, UiOrderType } from '@cowprotocol/types'

import { useSetAlternativeOrder } from 'modules/trade/state/alternativeOrder'

import { isCreating, isPending } from 'common/hooks/useCategorizeRecentActivity'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'
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

export function useGetShowAlternativeOrderModal(order: ParsedOrder | null): Command | null {
  const setAlternativeOrder = useSetAlternativeOrder()

  return useMemo(
    () =>
      !order || isCreating(order) || getUiOrderType(order) !== UiOrderType.LIMIT
        ? null
        : () => setAlternativeOrder(order, isPending(order)),
    [order, setAlternativeOrder]
  )
}
