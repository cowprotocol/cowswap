import { MutableRefObject } from 'react'

import { CowAnalytics } from '@cowprotocol/analytics'
import { isProdLike } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { bffAffiliateApi } from 'modules/affiliate/api/bffAffiliateApi'

import {
  isReferralCodeLengthValid,
  sanitizeReferralCode,
  type PartnerProgramParams,
} from '../../lib/affiliate-program-utils'
import {
  TraderReferralCodeResponse,
  TraderReferralCodeContextValue,
  TraderReferralCodeVerificationResponse,
  TraderReferralCodeVerificationStatus,
  TraderWalletReferralCodeState,
} from '../partner-trader-types'

export interface PerformVerificationParams {
  rawCode: string
  account?: string
  chainId?: number
  supportedNetwork: boolean
  toggleWalletModal: () => void
  actions: TraderReferralCodeContextValue['actions']
  analytics: CowAnalytics
  pendingVerificationRef: MutableRefObject<number | null>
  applyVerificationResult: (
    status: TraderReferralCodeVerificationStatus,
    walletState?: TraderWalletReferralCodeState,
  ) => void
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void
  incomingCode?: string
  savedCode?: string
  currentVerification: TraderReferralCodeVerificationStatus
  previousVerification?: TraderReferralCodeVerificationStatus
}

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

  const requestId = startVerificationRequest({ sanitizedCode, baseParams })

  try {
    const response = await bffAffiliateApi.verifyReferralCode({
      code: sanitizedCode,
      account: baseParams.account,
      chainId: baseParams.chainId,
    })

    if (pendingVerificationRef.current !== requestId) {
      return
    }

    const preserveExisting =
      Boolean(baseParams.incomingCode) &&
      shouldPreserveExistingCode(
        baseParams.previousVerification ?? baseParams.currentVerification,
        baseParams.savedCode,
      )

    handleCodeStatusResponse({
      response,
      sanitizedCode,
      actions,
      applyVerificationResult,
      trackVerifyResult,
      preserveExisting,
      currentVerification: baseParams.previousVerification ?? baseParams.currentVerification,
    })
    pendingVerificationRef.current = null
  } catch (error) {
    await new Promise((resolve) => setTimeout(resolve, 5_000)) // artificial delay to limit API spam

    if (pendingVerificationRef.current !== requestId) {
      return
    }

    const status = (error as Error & { status?: number }).status
    const errorType = status ? 'network' : 'unknown'
    const message = 'Unable to check code right now.'

    applyVerificationResult({ kind: 'error', code: sanitizedCode, errorType, message })
    trackVerifyResult('error', false, `type=${errorType}`)
    pendingVerificationRef.current = null

    if (!isProdLike) {
      console.warn('[ReferralCode] Verification failed', error)
    }
  }
}

interface SanitizedContext {
  sanitizedCode: string
  baseParams: PerformVerificationParams
}

function sanitizeAndValidate(params: PerformVerificationParams): SanitizedContext | null {
  const sanitizedCode = sanitizeReferralCode(params.rawCode)

  if (!sanitizedCode || !isReferralCodeLengthValid(sanitizedCode)) {
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
  const { account, chainId, supportedNetwork, toggleWalletModal, actions } = params

  if (!account) {
    toggleWalletModal()
    return false
  }

  if (!supportedNetwork || chainId === undefined) {
    actions.setWalletState({ status: 'unsupported', chainId })
    return false
  }

  return true
}

function startVerificationRequest(params: {
  sanitizedCode: string
  baseParams: PerformVerificationParams & { account: string; chainId: SupportedChainId }
}): number {
  const { sanitizedCode, baseParams } = params
  const { actions, analytics, account, supportedNetwork, pendingVerificationRef } = baseParams

  const requestId = Date.now()
  pendingVerificationRef.current = requestId
  actions.startVerification(sanitizedCode)
  analytics.sendEvent({
    category: 'referral',
    action: 'verify_started',
    label: `hasWallet=${account ? 'yes' : 'no'};supported=${supportedNetwork ? 'yes' : 'no'}`,
    value: sanitizedCode.length,
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
  actions: TraderReferralCodeContextValue['actions']
  applyVerificationResult: (
    status: TraderReferralCodeVerificationStatus,
    walletState?: TraderWalletReferralCodeState,
  ) => void
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
    const message = 'Unable to check code right now.'
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
    programParams: toPartnerProgramParams(response.data),
  })
  trackVerifyResult('valid', true)
}

function toPartnerProgramParams(data?: TraderReferralCodeResponse): PartnerProgramParams | undefined {
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
  applyVerificationResult: (
    status: TraderReferralCodeVerificationStatus,
    walletState?: TraderWalletReferralCodeState,
  ) => void
}): void {
  const { currentVerification, applyVerificationResult } = params

  if (currentVerification.kind === 'linked') {
    applyVerificationResult(
      { kind: 'linked', code: currentVerification.code, linkedCode: currentVerification.linkedCode },
      { status: 'linked', code: currentVerification.linkedCode },
    )
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
