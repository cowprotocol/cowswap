import { MutableRefObject } from 'react'

import { ReferralContextValue, ReferralVerificationStatus, WalletReferralState } from '../types'

const DEBUG_CODE_PREFIX = 'DEBUG'

interface DebugVerificationContext {
  code: string
  actions: ReferralContextValue['actions']
  applyVerificationResult: (status: ReferralVerificationStatus, walletState?: WalletReferralState) => void
  track: (result: string, eligible: boolean, extraLabel?: string) => void
  pendingVerificationRef: MutableRefObject<number | null>
}

type DebugHandler = (context: DebugVerificationContext) => void

const DEBUG_HANDLERS: Record<string, DebugHandler> = {
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
  INVALID: ({ code, actions, applyVerificationResult, track, pendingVerificationRef }) => {
    actions.setSavedCode(code)
    actions.setWalletState({ status: 'eligible' })
    applyVerificationResult({ kind: 'invalid', code })
    pendingVerificationRef.current = null
    track('invalid', false)
  },
  EXPIRED: ({ code, actions, applyVerificationResult, track, pendingVerificationRef }) => {
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
  INELIGIBLE: ({ code, actions, applyVerificationResult, track, pendingVerificationRef }) => {
    const reason = 'Debug ineligible wallet'
    actions.setSavedCode(code)
    applyVerificationResult({ kind: 'ineligible', code, reason }, { status: 'ineligible', reason })
    pendingVerificationRef.current = null
    track('ineligible', false, reason)
  },
  ERROR: ({ code, actions, applyVerificationResult, track, pendingVerificationRef }) => {
    const message = 'Debug referral error'
    actions.setSavedCode(code)
    actions.setWalletState({ status: 'eligible' })
    applyVerificationResult({ kind: 'error', code, errorType: 'network', message })
    pendingVerificationRef.current = null
    track('error', false, 'type=network')
  },
}

export function handleDebugVerification(params: {
  sanitizedCode: string
  actions: ReferralContextValue['actions']
  applyVerificationResult: (status: ReferralVerificationStatus, walletState?: WalletReferralState) => void
  trackVerifyResult: (result: string, eligible: boolean, extraLabel?: string) => void
  pendingVerificationRef: MutableRefObject<number | null>
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
  })

  return true
}
