import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { Command, UiOrderType } from '@cowprotocol/types'

import { useSetAlternativeOrder } from 'modules/trade/state/alternativeOrder'

import { isCreating, isPending } from 'common/hooks/useCategorizeRecentActivity'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'
import { isOffchainOrder, ParsedOrder } from 'utils/orderUtils/parseOrder'

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

export type AlternativeOrderModalContext = { showAlternativeOrderModal: Command; isEdit: boolean } | null

export function useGetAlternativeOrderModalContext(order: ParsedOrder | null): AlternativeOrderModalContext {
  const setAlternativeOrder = useSetAlternativeOrder()

  return useMemo(() => {
    const isEdit = order && isPending(order)

    return !order ||
      isCreating(order) ||
      getUiOrderType(order) !== UiOrderType.LIMIT ||
      (isEdit && !isOffchainOrder(order)) ||
      isEdit === null
      ? null
      : { showAlternativeOrderModal: () => setAlternativeOrder(order, isEdit), isEdit }
  }, [order, setAlternativeOrder])
}
