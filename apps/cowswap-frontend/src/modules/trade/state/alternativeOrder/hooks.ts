import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { alternativeModalAnalytics } from '@cowprotocol/analytics'

import { Order } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { alternativeOrderAtom, isAlternativeOrderModalVisibleAtom } from './atoms'

export function useIsAlternativeOrderModalVisible() {
  return useAtomValue(isAlternativeOrderModalVisibleAtom)
}

export function useHideAlternativeOrderModal() {
  const setAlternativeOrderAtom = useSetAtom(alternativeOrderAtom)

  return useCallback(() => setAlternativeOrderAtom(null), [setAlternativeOrderAtom])
}

export function useAlternativeOrder() {
  return useAtomValue(alternativeOrderAtom)
}

export function useSetAlternativeOrder() {
  const setAlternativeOrder = useSetAtom(alternativeOrderAtom)

  return useCallback(
    (order: Order | ParsedOrder, isEdit = false) => {
      alternativeModalAnalytics(isEdit, 'clicked')

      return setAlternativeOrder({ order, isEdit })
    },
    [setAlternativeOrder]
  )
}

/**
 * Returns the id of the order being edited, if it's an edit
 */
export function useReplacedOrderUid() {
  const { order, isEdit } = useAlternativeOrder() || {}

  return isEdit ? order?.id : undefined
}
