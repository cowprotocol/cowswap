import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { Command, UiOrderType } from '@cowprotocol/types'

import { IS_EDIT_ORDER_ENABLED, useSetAlternativeOrder } from 'modules/trade/state/alternativeOrder'

import { isCreating, isPending } from 'common/hooks/useCategorizeRecentActivity'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'
import { isOffchainOrder, ParsedOrder } from 'utils/orderUtils/parseOrder'

import { receiptAtom, updateReceiptAtom } from '../../state/orderReceiptAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
  const callback = useGetAlternativeOrderModalContextCallback()

  return useMemo(() => callback(order), [callback, order])
}

export function useGetAlternativeOrderModalContextCallback(): (
  order: ParsedOrder | null
) => AlternativeOrderModalContext {
  const setAlternativeOrder = useSetAlternativeOrder()

  return useCallback(
    (order: ParsedOrder | null) => getAlternativeOrderModalContext(order, setAlternativeOrder),
    [setAlternativeOrder]
  )
}

function getAlternativeOrderModalContext(
  order: ParsedOrder | null,
  setAlternativeOrder: ReturnType<typeof useSetAlternativeOrder>
): AlternativeOrderModalContext {
  const isEdit = order && isPending(order)

  if (
    !order ||
    isCreating(order) ||
    getUiOrderType(order) !== UiOrderType.LIMIT ||
    isEdit === null ||
    (isEdit && (!isOffchainOrder(order) || !IS_EDIT_ORDER_ENABLED))
  ) {
    return null
  } else {
    return { showAlternativeOrderModal: () => setAlternativeOrder(order, isEdit), isEdit }
  }
}
