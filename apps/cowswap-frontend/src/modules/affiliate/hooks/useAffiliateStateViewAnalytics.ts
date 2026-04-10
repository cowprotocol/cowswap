import { useEffect, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'

import { AffiliateAnalyticsAction } from '../analytics/affiliateAnalytics.types'
import { trackAffiliateEvent } from '../analytics/affiliateAnalytics.utils'

interface UseAffiliateStateViewAnalyticsParams {
  action: AffiliateAnalyticsAction
  eventParams?: Omit<Record<string, unknown>, 'action' | 'analytics'>
  viewKey?: string
}

export function useAffiliateStateViewAnalytics({
  action,
  eventParams,
  viewKey,
}: UseAffiliateStateViewAnalyticsParams): void {
  const analytics = useCowAnalytics()
  const lastViewKeyRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!viewKey) {
      lastViewKeyRef.current = undefined
      return
    }

    if (lastViewKeyRef.current === viewKey) {
      return
    }

    lastViewKeyRef.current = viewKey

    trackAffiliateEvent({
      analytics,
      action,
      ...(eventParams || {}),
    })
  }, [action, analytics, eventParams, viewKey])
}
