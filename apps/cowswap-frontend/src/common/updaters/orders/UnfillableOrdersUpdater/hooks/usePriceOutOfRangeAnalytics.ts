import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

export function usePriceOutOfRangeAnalytics(): (label: string) => void {
  const cowAnalytics = useCowAnalytics()

  return useCallback(
    (label: string) => {
      cowAnalytics.sendEvent({
        category: CowSwapAnalyticsCategory.TRADE,
        action: 'Price out of range',
        label,
      })
    },
    [cowAnalytics],
  )
}
