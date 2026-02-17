import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'

import type { CowAnalytics } from '@cowprotocol/analytics'

import { TraderWalletStatus } from './useAffiliateTraderWallet'

import { VERIFICATION_DEBOUNCE_MS } from '../config/affiliateProgram.const'
import { performVerification } from '../lib/affiliateProgram'
import { formatRefCode } from '../lib/affiliateProgramUtils'
import {
  completeTraderReferralVerificationAtom,
  setTraderReferralSavedCodeAtom,
  startTraderReferralVerificationAtom,
} from '../state/affiliateTraderWriteAtoms'

import type { AffiliateTraderModalState } from './useAffiliateTraderModalState'
import type { TraderReferralCodeVerificationResult } from '../lib/affiliateProgramTypes'

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
    (result: TraderReferralCodeVerificationResult) => {
      completeVerification(result)
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
          setSavedCode,
        },
        analytics,
        pendingVerificationRef,
        applyVerificationResult,
        trackVerifyResult,
        savedCode: traderReferralCode.savedCode,
        currentVerification: toVerificationResult(traderReferralCode),
      }),
    [
      account,
      analytics,
      applyVerificationResult,
      chainId,
      traderReferralCode,
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

  if (!traderReferralCode.modalOpen || traderReferralCode.verificationStatus !== 'pending') {
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

  return formatRefCode(traderReferralCode.code ?? traderReferralCode.savedCode)
}

function toVerificationResult(state: AffiliateTraderModalState): TraderReferralCodeVerificationResult {
  if (state.verificationStatus === 'idle') {
    return { kind: 'idle' }
  }

  const code = formatRefCode(state.code)
  if (!code) {
    return { kind: 'idle' }
  }

  if (state.verificationStatus === 'valid') {
    return toValidVerificationResult(state, code)
  }

  if (state.verificationStatus === 'linked') {
    return toLinkedVerificationResult(state, code)
  }

  if (state.verificationStatus === 'ineligible') {
    return toIneligibleVerificationResult(state, code)
  }

  if (state.verificationStatus === 'error') {
    return toErrorVerificationResult(state, code)
  }

  return toSimpleVerificationResult(state.verificationStatus, code)
}

function toSimpleVerificationResult(
  verificationStatus: AffiliateTraderModalState['verificationStatus'],
  code: string,
): TraderReferralCodeVerificationResult {
  if (verificationStatus === 'pending') return { kind: 'pending', code }
  if (verificationStatus === 'checking') return { kind: 'checking', code }
  if (verificationStatus === 'invalid') return { kind: 'invalid', code }
  return { kind: 'idle' }
}

function toValidVerificationResult(
  state: AffiliateTraderModalState,
  code: string,
): TraderReferralCodeVerificationResult {
  return {
    kind: 'valid',
    code,
    eligible: state.verificationEligible ?? true,
    programParams: state.verificationProgramParams,
  }
}

function toLinkedVerificationResult(
  _state: AffiliateTraderModalState,
  code: string,
): TraderReferralCodeVerificationResult {
  return {
    kind: 'linked',
    code,
    linkedCode: code,
  }
}

function toIneligibleVerificationResult(
  _state: AffiliateTraderModalState,
  code: string,
): TraderReferralCodeVerificationResult {
  return {
    kind: 'ineligible',
    code,
    reason: '',
  }
}

function toErrorVerificationResult(
  state: AffiliateTraderModalState,
  code: string,
): TraderReferralCodeVerificationResult {
  return {
    kind: 'error',
    code,
    errorType: 'unknown',
    message: state.verificationErrorMessage ?? '',
  }
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
