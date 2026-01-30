import { ReactNode, useEffect, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import type { CowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { isReferralCodeLengthValid, sanitizeReferralCode } from '../../lib/affiliate-program-utils'
import { useReferral } from '../hooks/useReferral'
import { useReferralActions } from '../hooks/useReferralActions'
import { ReferralContextValue } from '../types'

export function ReferralDeepLinkHandler(): ReactNode {
  const { isAffiliateRewardsEnabled = true } = useFeatureFlags()
  const actions = useReferralActions()
  const referral = useReferral()
  const location = useLocation()
  const navigate = useNavigate()
  const lastProcessedRef = useRef<string | null>(null)
  const analytics = useCowAnalytics()
  const savedCode = referral.savedCode
  const verificationKind = referral.verification.kind
  const walletStatus = referral.wallet.status

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
    const snapshot: ReferralSnapshot = {
      savedCode,
      verificationKind,
      walletStatus,
    }
    processReferralCode({ sanitized, snapshot, actions, analytics })
    stripReferralFromUrl()
  }, [
    actions,
    analytics,
    isAffiliateRewardsEnabled,
    location.hash,
    location.pathname,
    location.search,
    navigate,
    savedCode,
    verificationKind,
    walletStatus,
  ])

  return null
}

interface ReferralSnapshot {
  savedCode?: string
  verificationKind: ReferralContextValue['verification']['kind']
  walletStatus: ReferralContextValue['wallet']['status']
}

interface ProcessReferralParams {
  sanitized: string
  snapshot: ReferralSnapshot
  actions: ReferralContextValue['actions']
  analytics: CowAnalytics
}

function processReferralCode(params: ProcessReferralParams): void {
  // Snapshot-driven flow: we decide up front whether to reuse the existing code or
  // verify the incoming one. Persistence happens only on successful verification.
  const { sanitized, snapshot, actions, analytics } = params
  const isAlreadyLinked = snapshot.walletStatus === 'linked' || snapshot.verificationKind === 'linked'
  const isWalletIneligible = snapshot.walletStatus === 'ineligible'
  const isSameAsSaved = snapshot.savedCode ? snapshot.savedCode === sanitized : false
  const hasExistingCode = Boolean(snapshot.savedCode)
  const verificationKind = snapshot.verificationKind
  const verificationIsRecoverable = !['invalid', 'ineligible'].includes(verificationKind)
  const hasRestorableCode = hasExistingCode && !isSameAsSaved && verificationIsRecoverable

  actions.openModal('deeplink', { code: sanitized })

  if (isAlreadyLinked) {
    analytics.sendEvent({
      category: 'referral',
      action: 'deeplink_discarded',
      label: 'linked_wallet',
      value: sanitized.length,
    })
    return
  }

  if (isWalletIneligible) {
    analytics.sendEvent({
      category: 'referral',
      action: 'deeplink_discarded',
      label: 'ineligible_wallet',
      value: sanitized.length,
    })
    return
  }

  if (hasRestorableCode) {
    actions.setShouldAutoVerify(true)
    analytics.sendEvent({
      category: 'referral',
      action: 'deeplink_preserved',
      label: 'preserve_existing',
      value: sanitized.length,
    })
    return
  }

  if (!isSameAsSaved) {
    actions.setShouldAutoVerify(true)
    analytics.sendEvent({ category: 'referral', action: 'code_saved', label: 'deeplink', value: sanitized.length })
    return
  }

  analytics.sendEvent({
    category: 'referral',
    action: 'deeplink_repeat',
    label: 'existing_code',
    value: sanitized.length,
  })
}
