import { ReactNode, useEffect, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { useReferral } from '../hooks/useReferral'
import { useReferralActions } from '../hooks/useReferralActions'
import { isReferralCodeLengthValid, sanitizeReferralCode } from '../utils/code'

export function ReferralDeepLinkHandler(): ReactNode {
  const { isAffiliateRewardsEnabled = true } = useFeatureFlags()
  const actions = useReferralActions()
  const referral = useReferral()
  const location = useLocation()
  const navigate = useNavigate()
  const lastProcessedRef = useRef<string | null>(null)
  const analytics = useCowAnalytics()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const codeParam = params.get('ref')
    const stripReferralFromUrl = (): void => {
      params.delete('ref')
      const nextSearch = params.toString()
      navigate(
        {
          pathname: location.pathname,
          search: nextSearch ? `?${nextSearch}` : '',
          hash: location.hash,
        },
        { replace: true },
      )
    }

    if (!codeParam) {
      lastProcessedRef.current = null
      return
    }

    if (!isAffiliateRewardsEnabled) {
      stripReferralFromUrl()
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

    const isAlreadyLinked = referral.wallet.status === 'linked' || referral.verification.kind === 'linked'

    actions.setIncomingCode(sanitized)

    if (isAlreadyLinked) {
      actions.openModal('deeplink', { code: sanitized })
      analytics.sendEvent({
        category: 'referral',
        action: 'deeplink_discarded',
        label: 'linked_wallet',
        value: sanitized.length,
      })
    } else {
      actions.setSavedCode(sanitized)
      actions.openModal('deeplink', { code: sanitized })
      analytics.sendEvent({ category: 'referral', action: 'code_saved', label: 'deeplink', value: sanitized.length })
    }

    stripReferralFromUrl()
  }, [
    actions,
    analytics,
    isAffiliateRewardsEnabled,
    location.hash,
    location.pathname,
    location.search,
    navigate,
    referral.verification.kind,
    referral.wallet.status,
  ])

  return null
}
