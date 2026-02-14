import { useCallback, useEffect, useRef } from 'react'

import type { CowAnalytics } from '@cowprotocol/analytics'

import { performVerification } from '../lib/affiliateProgram'

import type {
  TraderReferralCodeContextValue,
  TraderReferralCodeVerificationStatus,
  TraderWalletReferralCodeState,
} from '../lib/affiliateProgramTypes'

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
