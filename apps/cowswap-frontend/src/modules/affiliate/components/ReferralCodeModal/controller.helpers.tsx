import { ReactNode, RefObject, useEffect, useMemo, useRef } from 'react'

import { CowAnalytics } from '@cowprotocol/analytics'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { PrimaryCta, StatusCopyResult } from './types'

import { useReferralModalState, ReferralModalUiState } from '../../hooks/useReferralModalState'
import { ReferralIncomingCodeReason, ReferralVerificationStatus, WalletReferralState } from '../../types'

type VerificationKind = ReturnType<typeof useReferralModalState>['verification']['kind']
type WalletStatus = WalletReferralState['status']

export function computePrimaryCta(params: {
  uiState: ReferralModalUiState
  hasValidLength: boolean
  hasCode: boolean
  verification: ReferralVerificationStatus
  verificationKind: VerificationKind
  walletStatus: WalletStatus
}): PrimaryCta {
  const { uiState, hasValidLength, hasCode, verification, verificationKind, walletStatus } = params

  if (uiState === 'editing') {
    return disabledCta(
      hasValidLength && hasCode ? t`Save to verify code` : t`Enter a referral code with 6 to 12 characters`,
    )
  }

  if (uiState === 'valid' || uiState === 'linked') {
    return { label: t`View rewards`, disabled: false, action: 'viewRewards' }
  }

  if (uiState === 'ineligible') {
    // Product copy requests the CTA stay disabled here so users understand they must try a different code.
    return disabledCta(t`Wallet ineligible. Try another code`)
  }

  if (uiState === 'error') {
    const label =
      verification.kind === 'error' && verification.message ? verification.message : t`Unable to verify code`
    return { label, disabled: true, action: 'none' }
  }

  const staticDisabledLabels: Partial<Record<ReferralModalUiState, string>> = {
    empty: t`Provide a valid referral code`,
    unsupported: t`Unsupported Network`,
    checking: t`Checking code…`,
    invalid: t`This code is invalid. Try another.`,
    expired: t`Rewards ended for this code. Try another.`,
  }

  const disabledLabel = staticDisabledLabels[uiState]

  if (disabledLabel) {
    return disabledCta(disabledLabel)
  }

  return verifyCta(hasValidLength, hasCode, verificationKind, walletStatus)
}

function disabledCta(label: string): PrimaryCta {
  return { label, disabled: true, action: 'none' }
}

function verifyCta(
  hasValidLength: boolean,
  hasCode: boolean,
  verificationKind: VerificationKind,
  walletStatus: WalletStatus,
): PrimaryCta {
  if (walletStatus === 'unsupported') {
    return disabledCta(t`Unsupported Network`)
  }

  const requiresConnection = walletStatus === 'disconnected' || walletStatus === 'unknown'

  return {
    label: requiresConnection ? t`Connect to verify code` : t`Verify code`,
    disabled: !hasValidLength || !hasCode || verificationKind === 'checking',
    action: 'verify',
  }
}

export function getHelperText(uiState: ReferralModalUiState): string | undefined {
  return uiState === 'empty'
    ? t`Referral codes contain 6-12 uppercase letters, numbers, dashes, or underscores`
    : undefined
}

export function getStatusCopy(verification: ReferralVerificationStatus): StatusCopyResult {
  return {
    shouldShowInfo: verification.kind === 'valid' && verification.eligible,
    infoMessage: t`Your wallet is eligible for rewards. After your first trade, the referral code will bind and stay active for 90 days.`,
  }
}

export function useReferralModalFocus(
  isOpen: boolean,
  uiState: ReferralModalUiState,
  inputRef: RefObject<HTMLInputElement | null>,
  ctaRef: RefObject<HTMLButtonElement | null>,
): void {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (uiState === 'valid' || uiState === 'linked') {
      ctaRef.current?.focus()
      return
    }

    if (uiState === 'invalid' || uiState === 'expired' || uiState === 'editing' || uiState === 'empty') {
      inputRef.current?.focus()
    }
  }, [ctaRef, inputRef, isOpen, uiState])
}

export function useReferralModalAnalytics(
  referral: ReturnType<typeof useReferralModalState>['referral'],
  uiState: ReferralModalUiState,
  analytics: CowAnalytics,
): void {
  const wasOpenRef = useRef(false)
  const lastUiStateRef = useRef<ReferralModalUiState | null>(null)

  useEffect(() => {
    if (referral.modalOpen && !wasOpenRef.current) {
      analytics.sendEvent({
        category: 'referral',
        action: 'modal_opened',
        label: referral.modalSource ?? 'unknown',
      })
    }

    wasOpenRef.current = referral.modalOpen

    if (!referral.modalOpen) {
      lastUiStateRef.current = null
    }
  }, [analytics, referral.modalOpen, referral.modalSource])

  useEffect(() => {
    if (!referral.modalOpen) {
      return
    }

    if (uiState === 'linked' && lastUiStateRef.current !== 'linked') {
      analytics.sendEvent({
        category: 'referral',
        action: 'view_linked',
        label: referral.modalSource ?? 'unknown',
      })
    }

    if (uiState === 'ineligible' && lastUiStateRef.current !== 'ineligible') {
      analytics.sendEvent({
        category: 'referral',
        action: 'view_ineligible',
        label: referral.modalSource ?? 'unknown',
      })
    }

    lastUiStateRef.current = uiState
  }, [analytics, referral.modalOpen, referral.modalSource, uiState])
}

export function useReferralMessages(
  codeForDisplay?: string,
  reason?: ReferralIncomingCodeReason,
): {
  linkedMessage: ReactNode
} {
  return useMemo(() => {
    if (!codeForDisplay) {
      return {
        linkedMessage: <Trans>Your wallet is already linked to a referral code.</Trans>,
      }
    }

    return {
      linkedMessage: (
        <>
          <Trans>
            The code <strong>{codeForDisplay}</strong> from your link wasn’t applied.
          </Trans>
          {renderRejectionReason(reason)}
        </>
      ),
    }
  }, [codeForDisplay, reason])
}

function renderRejectionReason(reason?: ReferralIncomingCodeReason): ReactNode {
  if (!reason) {
    return null
  }

  switch (reason) {
    case 'invalid':
      return (
        <>
          {' '}
          <Trans>It isn’t a valid referral code.</Trans>
        </>
      )
    case 'expired':
      return (
        <>
          {' '}
          <Trans>Rewards for this code have ended.</Trans>
        </>
      )
    case 'ineligible':
      return (
        <>
          {' '}
          <Trans>This wallet isn’t eligible for that code.</Trans>
        </>
      )
    default:
      return null
  }
}
