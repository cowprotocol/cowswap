import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'

import { Order } from 'legacy/state/orders/actions'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { alternativeOrderAtom, isAlternativeOrderModalVisibleAtom } from './atoms'

// Simple hook for analytics events
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useIsAlternativeOrderModalVisible() {
  return useAtomValue(isAlternativeOrderModalVisibleAtom)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useHideAlternativeOrderModal() {
  const setAlternativeOrderAtom = useSetAtom(alternativeOrderAtom)

  return useCallback(() => setAlternativeOrderAtom(null), [setAlternativeOrderAtom])
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAlternativeOrder() {
  return useAtomValue(alternativeOrderAtom)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useReplacedOrderUid() {
  const { order, isEdit } = useAlternativeOrder() || {}

  return isEdit ? order?.id : undefined
}
