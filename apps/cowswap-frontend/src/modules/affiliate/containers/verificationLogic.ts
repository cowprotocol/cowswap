import { MutableRefObject } from 'react'

import { CowAnalytics } from '@cowprotocol/analytics'
import { isProdLike } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { handleDebugVerification } from './verificationDebug'

import { verifyReferralCode } from '../services/referralApi'
import {
  ReferralContextValue,
  ReferralVerificationApiResponse,
  ReferralVerificationStatus,
  WalletReferralState,
} from '../types'
import { isReferralCodeLengthValid, sanitizeReferralCode } from '../utils/code'

export interface PerformVerificationParams {
  rawCode: string
  account?: string
  chainId?: number
  supportedNetwork: boolean
  toggleWalletModal: () => void
  actions: ReferralContextValue['actions']
  analytics: CowAnalytics
  pendingVerificationRef: MutableRefObject<number | null>
  applyVerificationResult: (status: ReferralVerificationStatus, walletState?: WalletReferralState) => void
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void
  incomingCode?: string
  savedCode?: string
  currentVerification: ReferralVerificationStatus
  previousVerification?: ReferralVerificationStatus
}

export async function performVerification(params: PerformVerificationParams): Promise<void> {
  const context = sanitizeAndValidate(params)

  if (!context) {
    return
  }

  const { sanitizedCode, baseParams } = context
  const { actions, pendingVerificationRef, applyVerificationResult, trackVerifyResult } = baseParams
  const preserveExisting =
    Boolean(baseParams.incomingCode) &&
    shouldPreserveExistingCode(baseParams.previousVerification ?? baseParams.currentVerification, baseParams.savedCode)
  const restoreExisting = (): void => {
    // When we have a previously validated code we restore that state instead of
    // letting the new verification clobber it (invalid deeplinks, transient errors).
    if (!preserveExisting) {
      return
    }

    restoreExistingVerificationState({
      currentVerification: baseParams.previousVerification ?? baseParams.currentVerification,
      applyVerificationResult: baseParams.applyVerificationResult,
    })
  }

  if (
    handleDebugVerification({
      sanitizedCode,
      actions,
      applyVerificationResult,
      trackVerifyResult,
      pendingVerificationRef,
      preserveExisting,
      restoreExisting,
    })
  ) {
    return
  }

  if (!ensurePrerequisites(baseParams)) {
    return
  }

  const requestId = startVerificationRequest({ sanitizedCode, baseParams })

  try {
    const response = await verifyReferralCode({
      code: sanitizedCode,
      account: baseParams.account,
      chainId: baseParams.chainId,
    })

    if (pendingVerificationRef.current !== requestId) {
      return
    }

    handleVerificationResponse({
      response,
      sanitizedCode,
      incomingCode: baseParams.incomingCode,
      actions,
      applyVerificationResult,
      trackVerifyResult,
      savedCode: baseParams.savedCode,
      currentVerification: baseParams.currentVerification,
      previousVerification: baseParams.previousVerification,
    })
    pendingVerificationRef.current = null
  } catch (error) {
    handleVerificationFailure({ error, sanitizedCode, requestId, baseParams })
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

function handleVerificationFailure(params: {
  error: unknown
  sanitizedCode: string
  requestId: number
  baseParams: PerformVerificationParams
}): void {
  const { error, sanitizedCode, requestId, baseParams } = params
  const { pendingVerificationRef, applyVerificationResult, trackVerifyResult } = baseParams

  if (pendingVerificationRef.current !== requestId) {
    return
  }

  const status = (error as Error & { status?: number }).status
  const errorType = status === 429 ? 'rate-limit' : 'network'
  const message = errorType === 'rate-limit' ? 'Too many attempts. Try later.' : 'Unable to check code right now.'

  applyVerificationResult({ kind: 'error', code: sanitizedCode, errorType, message })
  trackVerifyResult('error', false, `type=${errorType}`)
  pendingVerificationRef.current = null

  if (!isProdLike) {
    console.warn('[Referral] Verification failed', error)
  }
}

function handleVerificationResponse(params: {
  response: ReferralVerificationApiResponse
  sanitizedCode: string
  incomingCode?: string
  actions: ReferralContextValue['actions']
  applyVerificationResult: (status: ReferralVerificationStatus, walletState?: WalletReferralState) => void
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void
  savedCode?: string
  currentVerification: ReferralVerificationStatus
  previousVerification?: ReferralVerificationStatus
}): void {
  const {
    response,
    sanitizedCode,
    incomingCode,
    actions,
    applyVerificationResult,
    trackVerifyResult,
    savedCode,
    currentVerification,
    previousVerification,
  } = params
  const linked = sanitizeReferralCode(response.wallet.linkedCode || '')
  const preserveExisting =
    Boolean(incomingCode) && shouldPreserveExistingCode(previousVerification ?? currentVerification, savedCode)

  if (linked) {
    actions.setSavedCode(linked)
    applyVerificationResult(
      { kind: 'linked', code: sanitizedCode, linkedCode: linked },
      { status: 'linked', code: linked },
    )
    trackVerifyResult('linked', false)
    return
  }

  if (!response.wallet.eligible) {
    const reason = response.wallet.ineligibleReason || 'This wallet is not eligible for referral rewards.'
    const sanitizedIncoming = incomingCode ? sanitizeReferralCode(incomingCode) : undefined

    actions.setIncomingCodeReason('ineligible')

    if (preserveExisting) {
      restoreExistingVerificationState({
        currentVerification,
        applyVerificationResult,
      })
      trackVerifyResult('ineligible', false, reason)
      return
    }

    applyVerificationResult(
      {
        kind: 'ineligible',
        code: sanitizedCode,
        reason,
        incomingCode: sanitizedIncoming,
      },
      { status: 'ineligible', reason },
    )
    trackVerifyResult('ineligible', false, reason)
    return
  }

  handleCodeStatusResponse({
    response,
    sanitizedCode,
    actions,
    applyVerificationResult,
    trackVerifyResult,
    preserveExisting,
    currentVerification: previousVerification ?? currentVerification,
  })
}

function shouldPreserveExistingCode(currentVerification: ReferralVerificationStatus, savedCode?: string): boolean {
  if (!savedCode) {
    return false
  }

  return currentVerification.kind === 'valid' || currentVerification.kind === 'linked'
}

function handleCodeStatusResponse(params: {
  response: ReferralVerificationApiResponse
  sanitizedCode: string
  actions: ReferralContextValue['actions']
  applyVerificationResult: (status: ReferralVerificationStatus, walletState?: WalletReferralState) => void
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void
  preserveExisting: boolean
  currentVerification: ReferralVerificationStatus
}): void {
  const {
    response,
    sanitizedCode,
    actions,
    applyVerificationResult,
    trackVerifyResult,
    preserveExisting,
    currentVerification,
  } = params
  const programActive = response.code.programActive !== false

  if (response.code.status === 'invalid') {
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

  if (response.code.status === 'expired' || !programActive) {
    actions.setIncomingCodeReason('expired')

    if (preserveExisting) {
      restoreExistingVerificationState({
        currentVerification,
        applyVerificationResult,
      })
      trackVerifyResult('expired', false)
      return
    }

    applyVerificationResult({ kind: 'expired', code: sanitizedCode })
    trackVerifyResult('expired', false)
    return
  }

  actions.setIncomingCodeReason(undefined)
  actions.setSavedCode(sanitizedCode)
  applyVerificationResult({ kind: 'valid', code: sanitizedCode, eligible: true, programActive })
  trackVerifyResult('valid', true)
}

function restoreExistingVerificationState(params: {
  currentVerification: ReferralVerificationStatus
  applyVerificationResult: (status: ReferralVerificationStatus, walletState?: WalletReferralState) => void
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
      programActive: currentVerification.programActive,
    })
    return
  }

  applyVerificationResult(currentVerification)
}
