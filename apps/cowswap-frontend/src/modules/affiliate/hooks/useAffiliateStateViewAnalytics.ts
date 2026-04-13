import { useEffect, useMemo, useRef } from 'react'

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
  const lastEventSignatureRef = useRef<string | undefined>(undefined)
  const eventSignature = useMemo(() => {
    if (!viewKey) {
      return undefined
    }

    return JSON.stringify([
      action,
      viewKey,
      Object.entries(eventParams || {})
        .filter(([, value]) => value !== undefined)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)),
    ])
  }, [action, eventParams, viewKey])

  useEffect(() => {
    if (!eventSignature) {
      lastEventSignatureRef.current = undefined
      return
    }

    if (lastEventSignatureRef.current === eventSignature) {
      return
    }

    lastEventSignatureRef.current = eventSignature

    trackAffiliateEvent({
      analytics,
      action,
      ...(eventParams || {}),
    })
  }, [action, analytics, eventParams, eventSignature])
}
