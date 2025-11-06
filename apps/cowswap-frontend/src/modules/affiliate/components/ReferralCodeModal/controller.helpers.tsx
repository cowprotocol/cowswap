import { ReactNode, RefObject, useEffect, useMemo, useRef } from 'react'

import { CowAnalytics } from '@cowprotocol/analytics'

import { t, Trans } from '@lingui/macro'

import { PrimaryCta, StatusCopyResult } from './types'

import { useReferralModalState, ReferralModalUiState } from '../../hooks/useReferralModalState'
import { ReferralVerificationStatus, WalletReferralState } from '../../types'

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
      hasValidLength && hasCode ? t`Save to verify code` : t`Enter a referral code with 4 to 16 characters`,
    )
  }

  if (uiState === 'valid' || uiState === 'linked') {
    return { label: t`View rewards`, disabled: false, action: 'viewRewards' }
  }

  if (uiState === 'ineligible') {
    return { label: t`Go back`, disabled: false, action: 'goBack' }
  }

  if (uiState === 'error') {
    const label =
      verification.kind === 'error' && verification.message ? verification.message : t`Unable to verify code`
    return { label, disabled: false, action: 'verify' }
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
  return uiState === 'empty' ? t`Referral codes contain 4-16 letters or numbers` : undefined
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

export function useReferralMessages(codeForDisplay?: string): {
  linkedMessage: ReactNode
  ineligibleMessage: ReactNode
} {
  return useMemo(() => {
    if (!codeForDisplay) {
      return {
        linkedMessage: <Trans>Your wallet is already linked to a referral code.</Trans>,
        ineligibleMessage: <Trans>This wallet has already traded and is not eligible for referral rewards.</Trans>,
      }
    }

    return {
      linkedMessage: (
        <Trans>
          The code <strong>{codeForDisplay}</strong> from your link wasn’t applied.
        </Trans>
      ),
      ineligibleMessage: (
        <Trans>
          The code <strong>{codeForDisplay}</strong> from your link wasn’t applied because this wallet has already
          traded. Referral rewards are for new wallets only.
        </Trans>
      ),
    }
  }, [codeForDisplay])
}
