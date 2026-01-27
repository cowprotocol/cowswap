import { useCallback, useEffect, useRef } from 'react'

import type { CowAnalytics } from '@cowprotocol/analytics'

import { performVerification } from './verificationLogic'

import { isReferralCodeLengthValid, sanitizeReferralCode } from '../../lib/code'
import { ReferralContextValue, ReferralVerificationStatus, WalletReferralState } from '../types'

interface VerificationParams {
  referral: ReferralContextValue
  account?: string
  chainId?: number
  supportedNetwork: boolean
  analytics: CowAnalytics
  toggleWalletModal: () => void
}

export interface ReferralVerificationHandle {
  runVerification(code: string): Promise<void>
  cancelVerification(): void
}

export function useReferralVerification(params: VerificationParams): ReferralVerificationHandle {
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

  const runVerification = useCallback(
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
        savedCode: referral.savedCode,
        currentVerification: referral.verification,
        previousVerification: referral.previousVerification,
      }),
    [
      account,
      analytics,
      applyVerificationResult,
      chainId,
      referral.actions,
      referral.incomingCode,
      referral.previousVerification,
      referral.savedCode,
      referral.verification,
      supportedNetwork,
      toggleWalletModal,
      trackVerifyResult,
    ],
  )

  const cancelVerification = useCallback(() => {
    pendingVerificationRef.current = null
  }, [])

  useEffect(() => {
    referral.actions.registerCancelVerification(cancelVerification)

    return () => {
      referral.actions.registerCancelVerification(() => undefined)
    }
  }, [cancelVerification, referral.actions])

  return { runVerification, cancelVerification }
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
  const { shouldAutoVerify, savedCode, inputCode, incomingCode, verification } = referral

  useEffect(() => {
    const { code, shouldDisable } = resolveAutoVerification({
      shouldAutoVerify,
      walletStatus: referral.wallet.status,
      verificationKind: verification.kind,
      account,
      supportedNetwork,
      chainId,
      incomingCode,
      savedCode,
      inputCode,
    })

    if (shouldDisable) {
      referral.actions.setShouldAutoVerify(false)
      return
    }

    if (!code) {
      return
    }

    runVerification(code)
  }, [
    account,
    chainId,
    inputCode,
    incomingCode,
    referral.actions,
    referral.wallet.status,
    runVerification,
    savedCode,
    shouldAutoVerify,
    supportedNetwork,
    verification.kind,
  ])
}

interface ResolveAutoVerificationParams {
  shouldAutoVerify: boolean
  walletStatus: WalletReferralState['status']
  verificationKind: ReferralVerificationStatus['kind']
  account?: string
  supportedNetwork: boolean
  chainId?: number
  incomingCode?: string
  savedCode?: string
  inputCode: string
}

function resolveAutoVerification(params: ResolveAutoVerificationParams): { code?: string; shouldDisable: boolean } {
  // Centralises the auto-verify decision tree so the effect remains declarative.
  // Return `shouldDisable` when the modal must stop auto-verification (linked wallet),
  // otherwise surface the next code candidate once all prerequisites are satisfied.
  const { shouldAutoVerify } = params

  if (!shouldAutoVerify) {
    return { shouldDisable: false }
  }

  if (shouldDisableAutoVerification(params)) {
    return { shouldDisable: true }
  }

  const candidate = pickAutoVerificationCandidate(params)

  if (!candidate) {
    return { shouldDisable: false }
  }

  return { code: candidate, shouldDisable: false }
}

function shouldDisableAutoVerification(params: ResolveAutoVerificationParams): boolean {
  return params.walletStatus === 'linked' || params.verificationKind === 'linked'
}

function pickAutoVerificationCandidate(params: ResolveAutoVerificationParams): string | undefined {
  const { account, supportedNetwork, chainId, verificationKind, incomingCode, savedCode, inputCode } = params
  // If any prerequisite is missing we keep the modal idle and wait; the caller
  // will retry once account/network state changes or the current check finishes.
  if (!account || !supportedNetwork || chainId === undefined || verificationKind === 'checking') {
    return undefined
  }

  const sanitized = sanitizeReferralCode(incomingCode ?? savedCode ?? inputCode)

  if (!sanitized || !isReferralCodeLengthValid(sanitized)) {
    return undefined
  }

  return sanitized
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
