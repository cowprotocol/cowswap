import { RefObject } from 'react'

import { CowAnalytics } from '@cowprotocol/analytics'
import { delay, isProdLike } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { bffAffiliateApi } from 'modules/affiliate/api/bffAffiliateApi'

import { type AffiliateProgramParams } from './affiliateProgramTypes'
import { formatRefCode } from './affiliateProgramUtils'

import { VERIFICATION_RETRY_DELAY_MS } from '../config/affiliateProgram.const'

import type {
  TraderReferralCodeResponse,
  TraderReferralCodeVerificationResponse,
  TraderReferralCodeVerificationResult,
} from './affiliateProgramTypes'

interface TraderReferralVerificationActions {
  startVerification(code: string): void
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
  applyVerificationResult: (status: TraderReferralCodeVerificationResult) => void
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void
  savedCode?: string
  currentVerification: TraderReferralCodeVerificationResult
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

    handleCodeStatusResponse({
      response,
      sanitizedCode,
      actions,
      applyVerificationResult,
      trackVerifyResult,
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
    const affiliateCode = await bffAffiliateApi.getPartnerInfo(account)

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

function handleCodeStatusResponse(params: {
  response: TraderReferralCodeVerificationResponse
  sanitizedCode: string
  actions: TraderReferralVerificationActions
  applyVerificationResult: (status: TraderReferralCodeVerificationResult) => void
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void
}): void {
  const { response, sanitizedCode, actions, applyVerificationResult, trackVerifyResult } = params

  if (!response.ok) {
    if (response.status === 404 || response.status === 403) {
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

  actions.setSavedCode(sanitizedCode)
  applyVerificationResult({
    kind: 'valid',
    code: sanitizedCode,
    eligible: true,
    programParams: toProgramParams(response.data),
  })
  trackVerifyResult('valid', true)
}

function toProgramParams(data?: TraderReferralCodeResponse): AffiliateProgramParams | undefined {
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

async function applyVerificationError(params: {
  error: unknown
  sanitizedCode: string
  requestId: number
  pendingVerificationRef: PerformVerificationParams['pendingVerificationRef']
  applyVerificationResult: (status: TraderReferralCodeVerificationResult) => void
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
