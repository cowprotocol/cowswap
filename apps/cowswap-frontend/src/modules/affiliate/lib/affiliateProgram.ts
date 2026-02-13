import { RefObject } from 'react'

import { CowAnalytics } from '@cowprotocol/analytics'
import { delay, isProdLike } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { bffAffiliateApi } from 'modules/affiliate/api/bffAffiliateApi'

import { formatRefCode, type PartnerProgramParams } from './affiliateProgramUtils'

import { VERIFICATION_RETRY_DELAY_MS } from '../config/affiliateProgram.const'

import type {
  TraderReferralCodeIncomingReason,
  TraderReferralCodeResponse,
  TraderReferralCodeVerificationResponse,
  TraderReferralCodeVerificationStatus,
} from './affiliateProgramTypes'

interface TraderReferralVerificationActions {
  startVerification(code: string): void
  setIncomingCodeReason(reason?: TraderReferralCodeIncomingReason): void
  setSavedCode(code?: string): void
}

export interface PerformVerificationParams {
  rawCode: string
  account?: string
  chainId?: number
  supportedNetwork: boolean
  toggleWalletModal: () => void
  actions: TraderReferralVerificationActions
  analytics: CowAnalytics
  pendingVerificationRef: RefObject<number | null>
  applyVerificationResult: (status: TraderReferralCodeVerificationStatus) => void
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void
  incomingCode?: string
  savedCode?: string
  currentVerification: TraderReferralCodeVerificationStatus
}

interface SanitizedContext {
  sanitizedCode: string
  baseParams: PerformVerificationParams
}

const SELF_REFERRAL_ERROR_MESSAGE = 'You cannot apply your own referral code.'

// eslint-disable-next-line complexity
export async function performVerification(params: PerformVerificationParams): Promise<void> {
  const context = sanitizeAndValidate(params)

  if (!context) {
    return
  }

  const { sanitizedCode, baseParams } = context
  const { actions, pendingVerificationRef, applyVerificationResult, trackVerifyResult } = baseParams

  if (!ensurePrerequisites(baseParams)) {
    return
  }

  if (pendingVerificationRef.current !== null && baseParams.currentVerification.kind === 'checking') {
    if (baseParams.currentVerification.code === sanitizedCode) {
      return
    }
    pendingVerificationRef.current = null
  }

  const requestId = startVerificationRequest({ sanitizedCode, baseParams })

  try {
    const isSelfReferral = await isOwnAffiliateCode({
      account: baseParams.account,
      code: sanitizedCode,
    })

    if (isSelfReferral) {
      if (pendingVerificationRef.current !== requestId) {
        return
      }

      applyVerificationResult({
        kind: 'error',
        code: sanitizedCode,
        errorType: 'unknown',
        message: SELF_REFERRAL_ERROR_MESSAGE,
      })
      trackVerifyResult('error', false, 'type=self_referral')
      pendingVerificationRef.current = null
      return
    }

    const response = await bffAffiliateApi.verifyReferralCode({
      code: sanitizedCode,
    })

    if (pendingVerificationRef.current !== requestId) {
      return
    }

    const shouldProceed = await handleRetryDelay({ response, requestId, pendingVerificationRef })

    if (!shouldProceed) {
      return
    }

    const preserveExisting =
      Boolean(baseParams.incomingCode) &&
      shouldPreserveExistingCode(baseParams.currentVerification, baseParams.savedCode)

    handleCodeStatusResponse({
      response,
      sanitizedCode,
      actions,
      applyVerificationResult,
      trackVerifyResult,
      preserveExisting,
      currentVerification: baseParams.currentVerification,
    })
    pendingVerificationRef.current = null
  } catch (error) {
    await applyVerificationError({
      error,
      sanitizedCode,
      requestId,
      pendingVerificationRef,
      applyVerificationResult,
      trackVerifyResult,
    })
  }
}

async function isOwnAffiliateCode(params: { account: string; code: string }): Promise<boolean> {
  const { account, code } = params

  try {
    const affiliateCode = await bffAffiliateApi.getAffiliateCode(account)

    if (!affiliateCode?.code) {
      return false
    }

    return formatRefCode(affiliateCode.code) === formatRefCode(code)
  } catch {
    return false
  }
}

function sanitizeAndValidate(params: PerformVerificationParams): SanitizedContext | null {
  const sanitizedCode = formatRefCode(params.rawCode)

  if (!sanitizedCode) {
    return null
  }

  return {
    sanitizedCode,
    baseParams: { ...params },
  }
}

function ensurePrerequisites(
  params: PerformVerificationParams,
): params is PerformVerificationParams & { account: string; chainId: SupportedChainId } {
  const { account, chainId, supportedNetwork, toggleWalletModal } = params

  if (!account) {
    toggleWalletModal()
    return false
  }

  if (!supportedNetwork || chainId === undefined) {
    return false
  }

  return true
}

function startVerificationRequest(params: {
  sanitizedCode: string
  baseParams: PerformVerificationParams & { account: string; chainId: SupportedChainId }
}): number {
  const { sanitizedCode, baseParams } = params
  const { actions, analytics, pendingVerificationRef } = baseParams

  const requestId = Date.now()
  pendingVerificationRef.current = requestId
  actions.startVerification(sanitizedCode)
  analytics.sendEvent({
    category: 'affiliate',
    action: 'verify_started',
    label: sanitizedCode,
  })

  return requestId
}

function shouldPreserveExistingCode(
  currentVerification: TraderReferralCodeVerificationStatus,
  savedCode?: string,
): boolean {
  if (!savedCode) {
    return false
  }

  return currentVerification.kind === 'valid' || currentVerification.kind === 'linked'
}

function handleCodeStatusResponse(params: {
  response: TraderReferralCodeVerificationResponse
  sanitizedCode: string
  actions: TraderReferralVerificationActions
  applyVerificationResult: (status: TraderReferralCodeVerificationStatus) => void
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void
  preserveExisting: boolean
  currentVerification: TraderReferralCodeVerificationStatus
}): void {
  const { response, sanitizedCode, actions, applyVerificationResult, trackVerifyResult, preserveExisting } = params
  const { currentVerification } = params

  if (!response.ok) {
    if (response.status === 404 || response.status === 403) {
      actions.setIncomingCodeReason('invalid')

      if (preserveExisting) {
        restoreExistingVerificationState({
          currentVerification,
          applyVerificationResult,
        })
        trackVerifyResult('invalid', false)
        return
      }

      applyVerificationResult({ kind: 'invalid', code: sanitizedCode })
      trackVerifyResult('invalid', false)
      return
    }

    const errorType = response.status ? 'network' : 'unknown'
    const message = 'Affiliate service is unreachable.  Try again later.'
    applyVerificationResult({ kind: 'error', code: sanitizedCode, errorType, message })
    trackVerifyResult('error', false, `type=${errorType}`)
    return
  }

  actions.setIncomingCodeReason(undefined)
  actions.setSavedCode(sanitizedCode)
  applyVerificationResult({
    kind: 'valid',
    code: sanitizedCode,
    eligible: true,
    programParams: toProgramParams(response.data),
  })
  trackVerifyResult('valid', true)
}

function toProgramParams(data?: TraderReferralCodeResponse): PartnerProgramParams | undefined {
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

function restoreExistingVerificationState(params: {
  currentVerification: TraderReferralCodeVerificationStatus
  applyVerificationResult: (status: TraderReferralCodeVerificationStatus) => void
}): void {
  const { currentVerification, applyVerificationResult } = params

  if (currentVerification.kind === 'linked') {
    applyVerificationResult({
      kind: 'linked',
      code: currentVerification.code,
      linkedCode: currentVerification.linkedCode,
    })
    return
  }

  if (currentVerification.kind === 'valid') {
    applyVerificationResult({
      kind: 'valid',
      code: currentVerification.code,
      eligible: currentVerification.eligible,
      programParams: currentVerification.programParams,
    })
    return
  }

  applyVerificationResult(currentVerification)
}

async function applyVerificationError(params: {
  error: unknown
  sanitizedCode: string
  requestId: number
  pendingVerificationRef: PerformVerificationParams['pendingVerificationRef']
  applyVerificationResult: (status: TraderReferralCodeVerificationStatus) => void
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void
}): Promise<void> {
  const { error, sanitizedCode, requestId, pendingVerificationRef, applyVerificationResult, trackVerifyResult } = params

  await delay(VERIFICATION_RETRY_DELAY_MS)

  if (pendingVerificationRef.current !== requestId) {
    return
  }

  const status = (error as Error & { status?: number }).status
  const errorType = status ? 'network' : 'unknown'
  const message = 'Affiliate service is unreachable. Try again later.'

  applyVerificationResult({ kind: 'error', code: sanitizedCode, errorType, message })
  trackVerifyResult('error', false, `type=${errorType}`)
  pendingVerificationRef.current = null

  if (!isProdLike) {
    console.warn('[ReferralCode] Verification failed', error)
  }
}

async function handleRetryDelay(params: {
  response: TraderReferralCodeVerificationResponse
  requestId: number
  pendingVerificationRef: PerformVerificationParams['pendingVerificationRef']
}): Promise<boolean> {
  const { response, requestId, pendingVerificationRef } = params

  if (response.status !== 404) {
    return true
  }

  await delay(VERIFICATION_RETRY_DELAY_MS)

  return pendingVerificationRef.current === requestId
}
