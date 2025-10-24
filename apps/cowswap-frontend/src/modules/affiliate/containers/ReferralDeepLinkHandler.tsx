import { ReactNode, useEffect, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { useReferralActions } from '../hooks/useReferralActions'
import { isReferralCodeLengthValid, sanitizeReferralCode } from '../utils/code'

export function ReferralDeepLinkHandler(): ReactNode {
  const actions = useReferralActions()
  const location = useLocation()
  const navigate = useNavigate()
  const lastProcessedRef = useRef<string | null>(null)
  const analytics = useCowAnalytics()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const codeParam = params.get('ref')

    if (!codeParam) {
      lastProcessedRef.current = null
      return
    }

    const sanitized = sanitizeReferralCode(codeParam)

    if (!sanitized || !isReferralCodeLengthValid(sanitized)) {
      return
    }

    if (lastProcessedRef.current === sanitized) {
      return
    }

    lastProcessedRef.current = sanitized

    actions.setIncomingCode(sanitized)
    actions.setSavedCode(sanitized)
    actions.openModal('deeplink', { code: sanitized })
    analytics.sendEvent({ category: 'referral', action: 'code_saved', label: 'deeplink', value: sanitized.length })

    params.delete('ref')
    navigate({ pathname: location.pathname, search: params.toString(), hash: location.hash }, { replace: true })
  }, [actions, analytics, location.hash, location.pathname, location.search, navigate])

  return null
}
