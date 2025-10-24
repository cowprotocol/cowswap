import { RefObject, useEffect, useMemo, useRef } from 'react'

import { CowAnalytics } from '@cowprotocol/analytics'

import { t } from '@lingui/macro'

import { PrimaryCta, StatusCopyResult } from './types'

import { useReferralModalState, ReferralModalUiState } from '../../hooks/useReferralModalState'
import { ReferralVerificationStatus } from '../../types'

type VerificationKind = ReturnType<typeof useReferralModalState>['verification']['kind']

export function computePrimaryCta(params: {
  uiState: ReferralModalUiState
  hasValidLength: boolean
  hasCode: boolean
  verificationKind: VerificationKind
}): PrimaryCta {
  const { uiState, hasValidLength, hasCode, verificationKind } = params

  switch (uiState) {
    case 'empty':
      return disabledCta(t`Provide a valid referral code.`)
    case 'unsupported':
      return disabledCta(t`Unsupported Network.`)
    case 'checking':
      return disabledCta(t`Checking code…`)
    case 'valid':
    case 'linked':
      return { label: t`View rewards.`, disabled: false, action: 'viewRewards' }
    case 'ineligible':
      return { label: t`Go back.`, disabled: false, action: 'goBack' }
    case 'invalid':
    case 'expired':
      return disabledCta(t`Connect to verify code.`)
    case 'error':
      return verifyCta(hasValidLength, hasCode, verificationKind)
    default:
      return verifyCta(hasValidLength, hasCode, verificationKind)
  }
}

function disabledCta(label: string): PrimaryCta {
  return { label, disabled: true, action: 'none' }
}

function verifyCta(
  hasValidLength: boolean,
  hasCode: boolean,
  verificationKind: VerificationKind,
): PrimaryCta {
  return {
    label: t`Connect to verify code.`,
    disabled: !hasValidLength || !hasCode || verificationKind === 'checking',
    action: 'verify',
  }
}

export function getHelperText(uiState: ReferralModalUiState): string | undefined {
  return uiState === 'empty' ? t`Provide a valid referral code.` : undefined
}

export function getStatusCopy(verification: ReferralVerificationStatus): StatusCopyResult {
  return {
    shouldShowInfo: verification.kind === 'valid' && verification.eligible,
    infoMessage: t`Your wallet is eligible for rewards. After your first trade, the referral code will bind and stay active for 90 days.`,
    expiredMessage: t`Rewards ended for this code. Try another.`,
    invalidMessage: t`This code is invalid. Try another.`,
    errorMessage: verification.kind === 'error' ? verification.message : undefined,
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

export function useReferralMessages(codeForDisplay?: string): { linkedMessage: string; ineligibleMessage: string } {
  return useMemo(() => {
    if (!codeForDisplay) {
      return {
        linkedMessage: t`Your wallet is already linked to a referral code.`,
        ineligibleMessage: t`This wallet has already traded and is not eligible for referral rewards.`,
      }
    }

    return {
      linkedMessage: t`The code ${codeForDisplay} from your link wasn’t applied.`,
      ineligibleMessage: t`The code ${codeForDisplay} from your link wasn’t applied because this wallet has already traded. Referral rewards are for new wallets only.`,
    }
  }, [codeForDisplay])
}
