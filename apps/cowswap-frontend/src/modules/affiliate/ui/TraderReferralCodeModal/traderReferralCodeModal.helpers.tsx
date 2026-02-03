import { ReactNode, RefObject, useEffect, useMemo, useRef } from 'react'

import { CowAnalytics } from '@cowprotocol/analytics'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { PrimaryCta, StatusCopyResult } from './types'

import {
  useTraderReferralCodeModalState,
  TraderReferralCodeModalUiState,
} from '../../model/hooks/useTraderReferralCodeModalState'
import {
  TraderReferralCodeIncomingReason,
  TraderReferralCodeVerificationStatus,
  TraderWalletReferralCodeState,
} from '../../model/partner-trader-types'

type VerificationKind = ReturnType<typeof useTraderReferralCodeModalState>['verification']['kind']
type WalletStatus = TraderWalletReferralCodeState['status']

export function computePrimaryCta(params: {
  uiState: TraderReferralCodeModalUiState
  hasValidLength: boolean
  hasCode: boolean
  verification: TraderReferralCodeVerificationStatus
  verificationKind: VerificationKind
  walletStatus: WalletStatus
}): PrimaryCta {
  const { uiState, hasValidLength, hasCode, verification, verificationKind, walletStatus } = params

  if (uiState === 'editing') {
    return disabledCta(
      hasValidLength && hasCode ? t`Save to verify code` : t`Enter a referral code with 5 to 20 characters`,
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
    return { label, disabled: true, action: 'none' }
  }

  const staticDisabledLabels: Partial<Record<TraderReferralCodeModalUiState, string>> = {
    empty: t`Provide a valid referral code`,
    unsupported: t`Unsupported Network`,
    checking: t`Checking code…`,
    invalid: t`This code is invalid. Try another.`,
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

export function getStatusCopy(
  verification: TraderReferralCodeVerificationStatus,
  timeCapDays?: number,
): StatusCopyResult {
  return {
    shouldShowInfo: verification.kind === 'valid' && verification.eligible,
    infoMessage: timeCapDays
      ? t`Your wallet is eligible for rewards. After your first trade, the referral code will bind and stay active for ${timeCapDays} days.`
      : t`Your wallet is eligible for rewards. After your first trade, the referral code will bind and stay active for the entire program.`,
  }
}

export function useTraderReferralCodeModalFocus(
  isOpen: boolean,
  uiState: TraderReferralCodeModalUiState,
  inputRef: RefObject<HTMLInputElement | null>,
  ctaRef: RefObject<HTMLButtonElement | null>,
): void {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (uiState === 'valid' || uiState === 'linked' || uiState === 'ineligible') {
      ctaRef.current?.focus()
      return
    }

    if (uiState === 'invalid' || uiState === 'editing' || uiState === 'empty') {
      inputRef.current?.focus()
    }
  }, [ctaRef, inputRef, isOpen, uiState])
}

export function useTraderReferralCodeModalAnalytics(
  traderReferralCode: ReturnType<typeof useTraderReferralCodeModalState>['traderReferralCode'],
  uiState: TraderReferralCodeModalUiState,
  analytics: CowAnalytics,
): void {
  const wasOpenRef = useRef(false)
  const lastUiStateRef = useRef<TraderReferralCodeModalUiState | null>(null)

  useEffect(() => {
    if (traderReferralCode.modalOpen && !wasOpenRef.current) {
      analytics.sendEvent({
        category: 'referral',
        action: 'modal_opened',
        label: traderReferralCode.modalSource ?? 'unknown',
      })
    }

    wasOpenRef.current = traderReferralCode.modalOpen

    if (!traderReferralCode.modalOpen) {
      lastUiStateRef.current = null
    }
  }, [analytics, traderReferralCode.modalOpen, traderReferralCode.modalSource])

  useEffect(() => {
    if (!traderReferralCode.modalOpen) {
      return
    }

    if (uiState === 'linked' && lastUiStateRef.current !== 'linked') {
      analytics.sendEvent({
        category: 'referral',
        action: 'view_linked',
        label: traderReferralCode.modalSource ?? 'unknown',
      })
    }

    if (uiState === 'ineligible' && lastUiStateRef.current !== 'ineligible') {
      analytics.sendEvent({
        category: 'referral',
        action: 'view_ineligible',
        label: traderReferralCode.modalSource ?? 'unknown',
      })
    }

    lastUiStateRef.current = uiState
  }, [analytics, traderReferralCode.modalOpen, traderReferralCode.modalSource, uiState])
}

export function useTraderReferralCodeMessages(
  codeForDisplay?: string,
  reason?: TraderReferralCodeIncomingReason,
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

function renderRejectionReason(reason?: TraderReferralCodeIncomingReason): ReactNode {
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
