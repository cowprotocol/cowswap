import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'

import type { CowAnalytics } from '@cowprotocol/analytics'

import { TraderWalletStatus } from './useAffiliateTraderWallet'

import { VERIFICATION_DEBOUNCE_MS } from '../config/affiliateProgram.const'
import { performVerification } from '../lib/affiliateProgram'
import { formatRefCode } from '../lib/affiliateProgramUtils'
import {
  completeTraderReferralVerificationAtom,
  setTraderReferralIncomingCodeReasonAtom,
  setTraderReferralSavedCodeAtom,
  startTraderReferralVerificationAtom,
} from '../state/affiliateTraderWriteAtoms'

import type { AffiliateTraderModalState } from './useAffiliateTraderModalState'
import type { TraderReferralCodeVerificationStatus } from '../lib/affiliateProgramTypes'

interface VerificationParams {
  traderReferralCode: AffiliateTraderModalState
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

export function useAffiliateTraderVerification(params: VerificationParams): TraderReferralCodeVerificationHandle {
  const { traderReferralCode, account, chainId, supportedNetwork, analytics, toggleWalletModal } = params
  const pendingVerificationRef = useRef<number | null>(null)
  const completeVerification = useSetAtom(completeTraderReferralVerificationAtom)
  const setIncomingCodeReason = useSetAtom(setTraderReferralIncomingCodeReasonAtom)
  const setSavedCode = useSetAtom(setTraderReferralSavedCodeAtom)
  const startVerification = useSetAtom(startTraderReferralVerificationAtom)
  const trackVerifyResult = useCallback(
    (result: string, eligible: boolean, extraLabel?: string) => {
      const parts = [`result=${result}`, `eligible=${eligible ? 'yes' : 'no'}`]

      if (extraLabel) {
        parts.push(extraLabel)
      }

      analytics.sendEvent({ category: 'affiliate', action: 'verify_result', label: parts.join(';') })
    },
    [analytics],
  )

  const applyVerificationResult = useCallback(
    (status: TraderReferralCodeVerificationStatus) => {
      completeVerification(status)
    },
    [completeVerification],
  )

  const runVerification = useCallback(
    (rawCode: string) =>
      performVerification({
        rawCode,
        account,
        chainId,
        supportedNetwork,
        toggleWalletModal,
        actions: {
          startVerification,
          setIncomingCodeReason,
          setSavedCode,
        },
        analytics,
        pendingVerificationRef,
        applyVerificationResult,
        trackVerifyResult,
        incomingCode: traderReferralCode.incomingCode,
        savedCode: traderReferralCode.savedCode,
        currentVerification: traderReferralCode.verification,
      }),
    [
      account,
      analytics,
      applyVerificationResult,
      chainId,
      traderReferralCode.incomingCode,
      traderReferralCode.savedCode,
      traderReferralCode.verification,
      setIncomingCodeReason,
      setSavedCode,
      startVerification,
      supportedNetwork,
      toggleWalletModal,
      trackVerifyResult,
    ],
  )

  const cancelVerification = useCallback(() => {
    pendingVerificationRef.current = null
  }, [])

  useAutoVerificationEffect({
    traderReferralCode,
    account,
    chainId,
    supportedNetwork,
    runVerification,
  })

  return { runVerification, cancelVerification }
}

interface AutoVerificationCodeParams {
  traderReferralCode: AffiliateTraderModalState
  account?: string
  chainId?: number
  supportedNetwork: boolean
}

function getAutoVerificationCode(params: AutoVerificationCodeParams): string | undefined {
  const { traderReferralCode, account, chainId, supportedNetwork } = params

  if (!traderReferralCode.modalOpen || traderReferralCode.verification.kind !== 'pending') {
    return undefined
  }

  if (
    traderReferralCode.walletStatus === TraderWalletStatus.LINKED ||
    traderReferralCode.walletStatus === TraderWalletStatus.INELIGIBLE
  ) {
    return undefined
  }

  if (!account || !supportedNetwork || chainId === undefined) {
    return undefined
  }

  return formatRefCode(traderReferralCode.incomingCode ?? traderReferralCode.inputCode ?? traderReferralCode.savedCode)
}

function useAutoVerificationEffect(params: {
  traderReferralCode: AffiliateTraderModalState
  account?: string
  chainId?: number
  supportedNetwork: boolean
  runVerification: (code: string) => Promise<void>
}): void {
  const { traderReferralCode, account, chainId, supportedNetwork, runVerification } = params

  useEffect(() => {
    const code = getAutoVerificationCode({
      traderReferralCode,
      account,
      chainId,
      supportedNetwork,
    })

    if (!code) {
      return
    }

    const timer = setTimeout(() => runVerification(code), VERIFICATION_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [account, chainId, runVerification, supportedNetwork, traderReferralCode])
}
