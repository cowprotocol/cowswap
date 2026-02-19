import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'

import { type CowAnalytics } from '@cowprotocol/analytics'
import { delay, isProdLike } from '@cowprotocol/common-utils'

import { TraderWalletStatus } from './useAffiliateTraderWallet'

import { bffAffiliateApi } from '../api/bffAffiliateApi'
import { VERIFICATION_DEBOUNCE_MS, VERIFICATION_RETRY_DELAY_MS } from '../config/affiliateProgram.const'
import { type AffiliateProgramParams, type TraderInfoResponse } from '../lib/affiliateProgramTypes'
import { formatRefCode } from '../lib/affiliateProgramUtils'
import {
  completeTraderReferralVerificationAtom,
  setTraderReferralSavedCodeAtom,
  startTraderReferralVerificationAtom,
} from '../state/affiliateTraderWriteAtoms'

export type TraderReferralCodeVerificationErrorType = 'network' | 'unknown'

export type TraderReferralCodeVerificationResult =
  | { kind: 'idle' }
  | { kind: 'pending'; code: string }
  | { kind: 'checking'; code: string }
  | { kind: 'valid'; code: string; eligible: boolean; programParams?: AffiliateProgramParams }
  | { kind: 'invalid'; code: string }
  | { kind: 'error'; code: string; errorType: TraderReferralCodeVerificationErrorType; message: string }

export type TraderReferralCodeVerificationStatus = TraderReferralCodeVerificationResult['kind']

type TraderReferralCodeState = {
  modalOpen: boolean
  codeInput: string
  savedCode?: string
  verificationStatus: TraderReferralCodeVerificationStatus
  verificationEligible?: boolean
  verificationProgramParams?: AffiliateProgramParams
  verificationErrorMessage?: string
  walletStatus: TraderWalletStatus
}

interface VerificationParams {
  traderReferralCode: TraderReferralCodeState
  account?: string
  chainId?: number
  supportedNetwork: boolean
  analytics: CowAnalytics
  toggleWalletModal: () => void
}

interface VerificationFlowParams extends VerificationParams {
  rawCode: string
  activeRequestRef: { current: number | null }
  requestCounterRef: { current: number }
  startVerification: (code: string) => void
  setSavedCode: (code?: string) => void
  completeVerification: (result: TraderReferralCodeVerificationResult) => void
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void
}

interface PreparedVerificationRequest {
  code: string
  account: string
  requestId: number
  isStale: () => boolean
}

export interface TraderReferralCodeVerificationHandle {
  runVerification(code: string): Promise<void>
  cancelVerification(): void
}

const SELF_REFERRAL_ERROR_MESSAGE = 'You cannot apply your own referral code.'
const AFFILIATE_UNREACHABLE_MESSAGE = 'Affiliate service is unreachable. Try again later.'

export function useAffiliateTraderVerification(params: VerificationParams): TraderReferralCodeVerificationHandle {
  const { traderReferralCode, account, chainId, supportedNetwork, analytics, toggleWalletModal } = params

  const activeRequestRef = useRef<number | null>(null)
  const requestCounterRef = useRef(0)

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

  const runVerification = useCallback(
    (rawCode: string) =>
      runVerificationFlow({
        rawCode,
        traderReferralCode,
        account,
        chainId,
        supportedNetwork,
        analytics,
        toggleWalletModal,
        activeRequestRef,
        requestCounterRef,
        startVerification,
        setSavedCode,
        completeVerification,
        trackVerifyResult,
      }),
    [
      account,
      analytics,
      chainId,
      completeVerification,
      setSavedCode,
      startVerification,
      supportedNetwork,
      toggleWalletModal,
      trackVerifyResult,
      traderReferralCode,
    ],
  )

  const cancelVerification = useCallback(() => {
    activeRequestRef.current = null
  }, [])

  useEffect(() => {
    const code = getAutoVerificationCode({ traderReferralCode, account, chainId, supportedNetwork })

    if (!code) {
      return
    }

    const timer = setTimeout(() => void runVerification(code), VERIFICATION_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [account, chainId, runVerification, supportedNetwork, traderReferralCode])

  return { runVerification, cancelVerification }
}

async function runVerificationFlow(params: VerificationFlowParams): Promise<void> {
  const prepared = prepareVerificationRequest(params)

  if (!prepared) {
    return
  }

  try {
    const isHandledBySelfReferral = await maybeHandleSelfReferral({ ...params, ...prepared })

    if (isHandledBySelfReferral) {
      return
    }

    await handleVerificationResponse({ ...params, ...prepared })
  } catch (error) {
    await handleVerificationFailure({ ...params, ...prepared, error })
  } finally {
    clearActiveRequest(params.activeRequestRef, prepared.requestId)
  }
}

function prepareVerificationRequest(params: VerificationFlowParams): PreparedVerificationRequest | undefined {
  const {
    rawCode,
    traderReferralCode,
    account,
    chainId,
    supportedNetwork,
    toggleWalletModal,
    startVerification,
    analytics,
    activeRequestRef,
    requestCounterRef,
  } = params

  const code = formatRefCode(rawCode)

  if (!code) {
    return undefined
  }

  if (!account) {
    toggleWalletModal()
    return undefined
  }

  if (!supportedNetwork || chainId === undefined) {
    return undefined
  }

  const checkingCode =
    traderReferralCode.verificationStatus === 'checking' ? formatRefCode(traderReferralCode.codeInput) : undefined

  if (activeRequestRef.current !== null && checkingCode === code) {
    return undefined
  }

  const requestId = requestCounterRef.current + 1
  requestCounterRef.current = requestId
  activeRequestRef.current = requestId

  startVerification(code)
  analytics.sendEvent({ category: 'affiliate', action: 'verify_started', label: code })

  return {
    code,
    account,
    requestId,
    isStale: () => activeRequestRef.current !== requestId,
  }
}

async function maybeHandleSelfReferral(params: VerificationFlowParams & PreparedVerificationRequest): Promise<boolean> {
  const { account, code, isStale, completeVerification, trackVerifyResult } = params

  const isSelfReferral = await isOwnAffiliateCode(account, code)

  if (isStale()) {
    return true
  }

  if (!isSelfReferral) {
    return false
  }

  completeVerification({
    kind: 'error',
    code,
    errorType: 'unknown',
    message: SELF_REFERRAL_ERROR_MESSAGE,
  })
  trackVerifyResult('error', false, 'type=self_referral')

  return true
}

async function handleVerificationResponse(params: VerificationFlowParams & PreparedVerificationRequest): Promise<void> {
  const { code, isStale, setSavedCode, completeVerification, trackVerifyResult } = params

  const response = await bffAffiliateApi.verifyReferralCode(code)

  if (isStale()) {
    return
  }

  await maybeDelayFor404(response.status)

  if (isStale()) {
    return
  }

  if (!response.ok) {
    applyErrorResponse(response.status, code, completeVerification, trackVerifyResult)
    return
  }

  setSavedCode(code)
  completeVerification({
    kind: 'valid',
    code,
    eligible: true,
    programParams: toProgramParams(response.data),
  })
  trackVerifyResult('valid', true)
}

function applyErrorResponse(
  status: number,
  code: string,
  completeVerification: (result: TraderReferralCodeVerificationResult) => void,
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void,
): void {
  if (status === 404 || status === 403) {
    completeVerification({ kind: 'invalid', code })
    trackVerifyResult('invalid', false)
    return
  }

  const errorType: TraderReferralCodeVerificationErrorType = status ? 'network' : 'unknown'

  completeVerification({
    kind: 'error',
    code,
    errorType,
    message: AFFILIATE_UNREACHABLE_MESSAGE,
  })
  trackVerifyResult('error', false, `type=${errorType}`)
}

async function handleVerificationFailure(
  params: VerificationFlowParams & PreparedVerificationRequest & { error: unknown },
): Promise<void> {
  const { error, code, isStale, completeVerification, trackVerifyResult } = params

  await delay(VERIFICATION_RETRY_DELAY_MS)

  if (isStale()) {
    return
  }

  const errorType = getVerificationErrorType(error)

  completeVerification({
    kind: 'error',
    code,
    errorType,
    message: AFFILIATE_UNREACHABLE_MESSAGE,
  })
  trackVerifyResult('error', false, `type=${errorType}`)

  if (!isProdLike) {
    console.warn('[ReferralCode] Verification failed', error)
  }
}

function clearActiveRequest(activeRequestRef: { current: number | null }, requestId: number): void {
  if (activeRequestRef.current === requestId) {
    activeRequestRef.current = null
  }
}

function getAutoVerificationCode(params: {
  traderReferralCode: TraderReferralCodeState
  account?: string
  chainId?: number
  supportedNetwork: boolean
}): string | undefined {
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

  return formatRefCode(traderReferralCode.codeInput ?? traderReferralCode.savedCode)
}

function toProgramParams(data?: TraderInfoResponse): AffiliateProgramParams | undefined {
  if (!data) {
    return undefined
  }

  const { traderRewardAmount, triggerVolume, timeCapDays, volumeCap } = data

  if (
    typeof traderRewardAmount !== 'number' ||
    typeof triggerVolume !== 'number' ||
    typeof timeCapDays !== 'number' ||
    typeof volumeCap !== 'number'
  ) {
    return undefined
  }

  return {
    traderRewardAmount,
    triggerVolumeUsd: triggerVolume,
    timeCapDays,
    volumeCapUsd: volumeCap,
  }
}

async function isOwnAffiliateCode(account: string, code: string): Promise<boolean> {
  try {
    const partnerInfo = await bffAffiliateApi.getPartnerInfo(account)

    return Boolean(partnerInfo?.code && formatRefCode(partnerInfo.code) === formatRefCode(code))
  } catch {
    return false
  }
}

async function maybeDelayFor404(status: number): Promise<void> {
  if (status !== 404) {
    return
  }

  await delay(VERIFICATION_RETRY_DELAY_MS)
}

function getVerificationErrorType(error: unknown): TraderReferralCodeVerificationErrorType {
  const status = (error as { status?: number }).status

  return status ? 'network' : 'unknown'
}
