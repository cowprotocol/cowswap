import { useCallback, useEffect, useRef } from 'react'

import type { CowAnalytics } from '@cowprotocol/analytics'

import { performVerification } from './verificationLogic'

import { VERIFICATION_DEBOUNCE_MS } from '../config/constants'
import { isReferralCodeLengthValid, sanitizeReferralCode } from '../lib/affiliate-program-utils'
import {
  TraderReferralCodeContextValue,
  TraderReferralCodeVerificationStatus,
  TraderWalletReferralCodeState,
} from '../state/affiliate-program-types'

interface VerificationParams {
  traderReferralCode: TraderReferralCodeContextValue
  account?: string
  chainId?: number
  supportedNetwork: boolean
  analytics: CowAnalytics
  toggleWalletModal: () => void
}

export interface TraderReferralCodeVerificationHandle {
  runVerification(code: string): Promise<void>
  cancelVerification(): void
}

export function useTraderReferralCodeVerification(params: VerificationParams): TraderReferralCodeVerificationHandle {
  const { traderReferralCode, account, chainId, supportedNetwork, analytics, toggleWalletModal } = params
  const pendingVerificationRef = useRef<number | null>(null)

  const applyVerificationResult = useCallback(
    (status: TraderReferralCodeVerificationStatus, walletState?: TraderWalletReferralCodeState) => {
      traderReferralCode.actions.completeVerification(status)

      if (walletState) {
        traderReferralCode.actions.setWalletState(walletState)
      }
    },
    [traderReferralCode.actions],
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
        actions: traderReferralCode.actions,
        analytics,
        pendingVerificationRef,
        applyVerificationResult,
        trackVerifyResult,
        incomingCode: traderReferralCode.incomingCode,
        savedCode: traderReferralCode.savedCode,
        currentVerification: traderReferralCode.verification,
        previousVerification: traderReferralCode.previousVerification,
      }),
    [
      account,
      analytics,
      applyVerificationResult,
      chainId,
      traderReferralCode.actions,
      traderReferralCode.incomingCode,
      traderReferralCode.previousVerification,
      traderReferralCode.savedCode,
      traderReferralCode.verification,
      supportedNetwork,
      toggleWalletModal,
      trackVerifyResult,
    ],
  )

  const cancelVerification = useCallback(() => {
    pendingVerificationRef.current = null
  }, [])

  useEffect(() => {
    traderReferralCode.actions.registerCancelVerification(cancelVerification)

    return () => {
      traderReferralCode.actions.registerCancelVerification(() => undefined)
    }
  }, [cancelVerification, traderReferralCode.actions])

  return { runVerification, cancelVerification }
}

interface AutoVerificationParams {
  traderReferralCode: TraderReferralCodeContextValue
  account?: string
  chainId?: number
  supportedNetwork: boolean
  runVerification: (code: string) => Promise<void>
}

export function useTraderReferralCodeAutoVerification(params: AutoVerificationParams): void {
  const { traderReferralCode, account, chainId, supportedNetwork, runVerification } = params
  const { shouldAutoVerify, savedCode, inputCode, incomingCode, verification } = traderReferralCode

  useEffect(() => {
    const { code, shouldDisable } = resolveAutoVerification({
      shouldAutoVerify,
      walletStatus: traderReferralCode.wallet.status,
      verificationKind: verification.kind,
      account,
      supportedNetwork,
      chainId,
      incomingCode,
      savedCode,
      inputCode,
    })

    if (shouldDisable) {
      traderReferralCode.actions.setShouldAutoVerify(false)
      return
    }

    if (!code) {
      return
    }

    const timer = setTimeout(() => {
      runVerification(code)
    }, VERIFICATION_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [
    account,
    chainId,
    inputCode,
    incomingCode,
    traderReferralCode.actions,
    traderReferralCode.wallet.status,
    runVerification,
    savedCode,
    shouldAutoVerify,
    supportedNetwork,
    verification.kind,
  ])
}

interface ResolveAutoVerificationParams {
  shouldAutoVerify: boolean
  walletStatus: TraderWalletReferralCodeState['status']
  verificationKind: TraderReferralCodeVerificationStatus['kind']
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
  return (
    params.walletStatus === 'linked' || params.walletStatus === 'ineligible' || params.verificationKind === 'linked'
  )
}

function pickAutoVerificationCandidate(params: ResolveAutoVerificationParams): string | undefined {
  const { account, supportedNetwork, chainId, verificationKind, incomingCode, savedCode, inputCode } = params
  // If any prerequisite is missing we keep the modal idle and wait; the caller
  // will retry once account/network state changes or the current check finishes.
  if (!account || !supportedNetwork || chainId === undefined || verificationKind === 'checking') {
    return undefined
  }

  const sanitized = sanitizeReferralCode(incomingCode ?? inputCode ?? savedCode)

  if (!sanitized || !isReferralCodeLengthValid(sanitized)) {
    return undefined
  }

  return sanitized
}
interface PendingVerificationParams {
  traderReferralCode: TraderReferralCodeContextValue
  runVerification: (code: string) => Promise<void>
}

export function usePendingReferralCodeVerificationHandler(params: PendingVerificationParams): void {
  const { traderReferralCode, runVerification } = params
  const { pendingVerificationRequest, actions, inputCode, savedCode } = traderReferralCode

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
