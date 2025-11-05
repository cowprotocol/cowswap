import { useCallback, useEffect, useRef } from 'react'

import type { CowAnalytics } from '@cowprotocol/analytics'

import { performVerification } from './verificationLogic'

import { ReferralContextValue, ReferralVerificationStatus, WalletReferralState } from '../types'
import { isReferralCodeLengthValid, sanitizeReferralCode } from '../utils/code'

interface VerificationParams {
  referral: ReferralContextValue
  account?: string
  chainId?: number
  supportedNetwork: boolean
  analytics: CowAnalytics
  toggleWalletModal: () => void
}

export function useReferralVerification(params: VerificationParams): (code: string) => Promise<void> {
  const { referral, account, chainId, supportedNetwork, analytics, toggleWalletModal } = params
  const pendingVerificationRef = useRef<number | null>(null)

  const applyVerificationResult = useCallback(
    (status: ReferralVerificationStatus, walletState?: WalletReferralState) => {
      referral.actions.completeVerification(status)

      if (walletState) {
        referral.actions.setWalletState(walletState)
      }
    },
    [referral.actions],
  )

  const trackVerifyResult = useCallback(
    (result: string, eligible: boolean, extraLabel?: string) => {
      const parts = [`result=${result}`, `eligible=${eligible ? 'yes' : 'no'}`]

      if (extraLabel) {
        parts.push(extraLabel)
      }

      analytics.sendEvent({ category: 'referral', action: 'verify_result', label: parts.join(';') })
    },
    [analytics],
  )

  return useCallback(
    (rawCode: string) =>
      performVerification({
        rawCode,
        account,
        chainId,
        supportedNetwork,
        toggleWalletModal,
        actions: referral.actions,
        analytics,
        pendingVerificationRef,
        applyVerificationResult,
        trackVerifyResult,
        incomingCode: referral.incomingCode,
      }),
    [
      account,
      analytics,
      applyVerificationResult,
      chainId,
      referral.actions,
      referral.incomingCode,
      supportedNetwork,
      toggleWalletModal,
      trackVerifyResult,
    ],
  )
}

interface AutoVerificationParams {
  referral: ReferralContextValue
  account?: string
  chainId?: number
  supportedNetwork: boolean
  runVerification: (code: string) => Promise<void>
}

export function useReferralAutoVerification(params: AutoVerificationParams): void {
  const { referral, account, chainId, supportedNetwork, runVerification } = params
  const { shouldAutoVerify, savedCode, inputCode, verification } = referral

  useEffect(() => {
    if (!shouldAutoVerify) {
      return
    }

    if (referral.wallet.status === 'linked' || verification.kind === 'linked') {
      referral.actions.setShouldAutoVerify(false)
      return
    }

    if (!account || !supportedNetwork || chainId === undefined) {
      return
    }

    const codeCandidate = savedCode || inputCode
    const sanitized = sanitizeReferralCode(codeCandidate)

    if (!isReferralCodeLengthValid(sanitized)) {
      return
    }

    if (verification.kind === 'checking') {
      return
    }

    runVerification(sanitized)
  }, [
    account,
    chainId,
    inputCode,
    referral.actions,
    referral.wallet.status,
    runVerification,
    savedCode,
    shouldAutoVerify,
    supportedNetwork,
    verification.kind,
  ])
}

interface PendingVerificationParams {
  referral: ReferralContextValue
  runVerification: (code: string) => Promise<void>
}

export function usePendingVerificationHandler(params: PendingVerificationParams): void {
  const { referral, runVerification } = params
  const { pendingVerificationRequest, actions, inputCode, savedCode } = referral

  useEffect(() => {
    if (!pendingVerificationRequest) {
      return
    }

    const { id, code } = pendingVerificationRequest
    const candidate = code ?? inputCode ?? savedCode

    if (!candidate) {
      actions.clearPendingVerification(id)
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        await runVerification(candidate)
      } finally {
        if (!cancelled) {
          actions.clearPendingVerification(id)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [actions, inputCode, pendingVerificationRequest, runVerification, savedCode])
}
