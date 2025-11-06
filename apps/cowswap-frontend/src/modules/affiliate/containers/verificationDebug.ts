import { MutableRefObject } from 'react'

import {
  ReferralContextValue,
  ReferralIncomingCodeReason,
  ReferralVerificationStatus,
  WalletReferralState,
} from '../types'

const DEBUG_CODE_PREFIX = 'DEBUG'

interface DebugVerificationContext {
  code: string
  actions: ReferralContextValue['actions']
  applyVerificationResult: (status: ReferralVerificationStatus, walletState?: WalletReferralState) => void
  track: (result: string, eligible: boolean, extraLabel?: string) => void
  pendingVerificationRef: MutableRefObject<number | null>
  preserveExisting: boolean
  restoreExisting: () => void
}

type DebugHandler = (context: DebugVerificationContext) => void

function applyPreservedResult(
  context: DebugVerificationContext,
  reason: ReferralIncomingCodeReason,
  trackLabel: string,
): void {
  context.actions.setIncomingCodeReason(reason)
  context.restoreExisting()
  context.pendingVerificationRef.current = null
  context.track(trackLabel, false)
}

const DEBUG_HANDLERS: Record<string, DebugHandler> = {
  // Each handler mirrors the real verification pipeline so debug codes behave exactly like
  // their backend counterparts (including preserved-code logic and analytics labels).
  IDLE: ({ actions, applyVerificationResult, track, pendingVerificationRef }) => {
    actions.setSavedCode(undefined)
    actions.setWalletState({ status: 'eligible' })
    applyVerificationResult({ kind: 'idle' })
    pendingVerificationRef.current = null
    track('idle', false)
  },
  PENDING: ({ code, actions, applyVerificationResult, track, pendingVerificationRef }) => {
    actions.setSavedCode(code)
    actions.setWalletState({ status: 'eligible' })
    applyVerificationResult({ kind: 'pending', code })
    pendingVerificationRef.current = null
    track('pending', false)
  },
  CHECKING: ({ code, actions, track, pendingVerificationRef }) => {
    actions.setSavedCode(code)
    actions.setWalletState({ status: 'eligible' })
    pendingVerificationRef.current = Date.now()
    actions.startVerification(code)
    track('checking', false)
  },
  VALID: ({ code, actions, applyVerificationResult, track, pendingVerificationRef }) => {
    actions.setSavedCode(code)
    actions.setWalletState({ status: 'eligible' })
    applyVerificationResult({ kind: 'valid', code, eligible: true, programActive: true })
    pendingVerificationRef.current = null
    track('valid', true)
  },
  INVALID: (context) => {
    const { code, actions, applyVerificationResult, track, pendingVerificationRef, preserveExisting } = context

    if (preserveExisting) {
      applyPreservedResult(context, 'invalid', 'invalid')
      return
    }

    actions.setIncomingCodeReason('invalid')
    actions.setSavedCode(code)
    actions.setWalletState({ status: 'eligible' })
    applyVerificationResult({ kind: 'invalid', code })
    pendingVerificationRef.current = null
    track('invalid', false)
  },
  EXPIRED: (context) => {
    const { code, actions, applyVerificationResult, track, pendingVerificationRef, preserveExisting } = context

    if (preserveExisting) {
      applyPreservedResult(context, 'expired', 'expired')
      return
    }

    actions.setIncomingCodeReason('expired')
    actions.setSavedCode(code)
    actions.setWalletState({ status: 'eligible' })
    applyVerificationResult({ kind: 'expired', code })
    pendingVerificationRef.current = null
    track('expired', false)
  },
  LINKED: ({ code, actions, applyVerificationResult, track, pendingVerificationRef }) => {
    actions.setSavedCode(code)
    applyVerificationResult({ kind: 'linked', code, linkedCode: code }, { status: 'linked', code })
    pendingVerificationRef.current = null
    track('linked', false)
  },
  INELIGIBLE: (context) => {
    const { code, actions, applyVerificationResult, track, pendingVerificationRef, preserveExisting } = context
    const reason = 'Debug ineligible wallet'

    if (preserveExisting) {
      applyPreservedResult(context, 'ineligible', 'ineligible')
      return
    }

    actions.setIncomingCodeReason('ineligible')
    actions.setSavedCode(code)
    applyVerificationResult({ kind: 'ineligible', code, reason }, { status: 'ineligible', reason })
    pendingVerificationRef.current = null
    track('ineligible', false, reason)
  },
  ERROR: ({ code, actions, applyVerificationResult, track, pendingVerificationRef }) => {
    const message = 'Debug referral error'
    actions.setWalletState({ status: 'eligible' })
    applyVerificationResult({ kind: 'error', code, errorType: 'network', message })
    pendingVerificationRef.current = null
    track('error', false, 'type=network')
  },
}

DEBUG_HANDLERS.VALID2 = DEBUG_HANDLERS.VALID

export function handleDebugVerification(params: {
  sanitizedCode: string
  actions: ReferralContextValue['actions']
  applyVerificationResult: (status: ReferralVerificationStatus, walletState?: WalletReferralState) => void
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void
  pendingVerificationRef: MutableRefObject<number | null>
  preserveExisting: boolean
  restoreExisting: () => void
}): boolean {
  const { sanitizedCode, actions, applyVerificationResult, trackVerifyResult, pendingVerificationRef } = params
  if (!sanitizedCode.startsWith(DEBUG_CODE_PREFIX)) {
    return false
  }

  const scenario = sanitizedCode.slice(DEBUG_CODE_PREFIX.length).toUpperCase()
  const handler = DEBUG_HANDLERS[scenario]

  if (!handler) {
    return false
  }

  handler({
    code: sanitizedCode,
    actions,
    applyVerificationResult,
    track: (result, eligible, extraLabel) => trackVerifyResult(`debug_${result}`, eligible, extraLabel),
    pendingVerificationRef,
    preserveExisting: params.preserveExisting,
    restoreExisting: params.restoreExisting,
  })

  return true
}
