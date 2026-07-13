import { useEffect, useMemo, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'

import { AffiliateAnalyticsAction } from '../analytics/affiliateAnalytics.types'
import { trackAffiliateEvent } from '../analytics/affiliateAnalytics.utils'

type AffiliateAnalyticsEventParams = Record<string, unknown> & {
  action?: never
  analytics?: never
}

interface UseAffiliateStateViewAnalyticsParams {
  action: AffiliateAnalyticsAction
  eventParams?: AffiliateAnalyticsEventParams
  viewKey?: string
}

export function useAffiliateStateViewAnalytics({
  action,
  eventParams,
  viewKey,
}: UseAffiliateStateViewAnalyticsParams): void {
  const analytics = useCowAnalytics()
  const lastEventSignatureRef = useRef<string | undefined>(undefined)
  const sanitizedEventParams = useMemo(() => sanitizeEventParams(eventParams), [eventParams])
  const eventSignature = useMemo(() => {
    if (!viewKey) {
      return undefined
    }

    return JSON.stringify([
      action,
      viewKey,
      Object.entries(sanitizedEventParams || {})
        .filter(([, value]) => value !== undefined)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)),
    ])
  }, [action, sanitizedEventParams, viewKey])

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
      ...(sanitizedEventParams || {}),
    })
  }, [action, analytics, eventSignature, sanitizedEventParams])
}

function sanitizeEventParams(
  eventParams: AffiliateAnalyticsEventParams | undefined,
): Record<string, unknown> | undefined {
  if (!eventParams) {
    return undefined
  }

  const sanitizedParams = { ...eventParams } as Record<string, unknown>
  delete sanitizedParams.action
  delete sanitizedParams.analytics

  return sanitizedParams
}
