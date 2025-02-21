import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'

import { Order } from 'legacy/state/orders/actions'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { alternativeOrderAtom, isAlternativeOrderModalVisibleAtom } from './atoms'

// Simple hook for analytics events
function useAlternativeModalAnalytics() {
  const cowAnalytics = useCowAnalytics()
  return useCallback(
    (action: string) => {
      cowAnalytics.sendEvent({
        category: CowSwapAnalyticsCategory.TRADE,
        action,
      })
    },
    [cowAnalytics],
  )
}

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
  const sendAnalytics = useAlternativeModalAnalytics()

  return useCallback(
    (order: Order | ParsedOrder, isEdit = false) => {
      sendAnalytics(isEdit ? 'Edit opened' : 'Create opened')
      return setAlternativeOrder({ order, isEdit })
    },
    [setAlternativeOrder, sendAnalytics],
  )
}

/**
 * Returns the id of the order being edited, if it's an edit
 */
export function useReplacedOrderUid() {
  const { order, isEdit } = useAlternativeOrder() || {}

  return isEdit ? order?.id : undefined
}
