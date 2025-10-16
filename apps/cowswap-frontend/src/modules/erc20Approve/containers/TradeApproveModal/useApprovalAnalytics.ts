import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

export function useApprovalAnalytics(): (action: string, symbol?: string, errorCode?: number | null) => void {
  const cowAnalytics = useCowAnalytics()

  return useCallback(
    (action: string, symbol?: string, errorCode?: number | null) => {
      cowAnalytics.sendEvent({
        category: CowSwapAnalyticsCategory.TRADE,
        action,
        label: symbol,
        ...(errorCode && { value: errorCode }),
      })
    },
    [cowAnalytics],
  )
}
