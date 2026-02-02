import { sanitizeReferralCode } from '../../lib/affiliate-program-utils'
import {
  TraderReferralCodeState,
  TraderReferralCodeIncomingReason,
  TraderReferralCodeModalSource,
  TraderReferralCodeVerificationStatus,
  TraderWalletReferralCodeState,
} from '../partner-trader-types'

export function reduceOpenModal(
  prev: TraderReferralCodeState,
  source: TraderReferralCodeModalSource,
  options?: { code?: string },
): TraderReferralCodeState {
  const sanitizedIncoming = options?.code ? sanitizeReferralCode(options.code) : undefined
  const isLinked = prev.wallet.status === 'linked' || prev.verification.kind === 'linked'

  const nextInputCode = resolveInputCode(prev, sanitizedIncoming, isLinked)
  const nextVerification = resolveVerification(prev, sanitizedIncoming, isLinked)
  const nextPreviousVerification = sanitizedIncoming && !isLinked ? prev.verification : prev.previousVerification

  return {
    ...prev,
    modalOpen: true,
    modalSource: source,
    editMode: false,
    incomingCode: sanitizedIncoming,
    incomingCodeReason: undefined,
    previousVerification: nextPreviousVerification,
    inputCode: nextInputCode,
    verification: nextVerification,
  }
}

function resolveInputCode(
  prev: TraderReferralCodeState,
  sanitizedIncoming: string | undefined,
  isLinked: boolean,
): string {
  const candidate = isLinked
    ? prev.savedCode || prev.inputCode || ''
    : (sanitizedIncoming ?? prev.inputCode ?? prev.savedCode ?? '')

  return sanitizeReferralCode(candidate) ?? ''
}

function resolveVerification(
  prev: TraderReferralCodeState,
  sanitizedIncoming: string | undefined,
  isLinked: boolean,
): TraderReferralCodeState['verification'] {
  if (!sanitizedIncoming || sanitizedIncoming === prev.savedCode || isLinked) {
    return prev.verification
  }

  return { kind: 'pending', code: sanitizedIncoming }
}

export function reduceCloseModal(prev: TraderReferralCodeState): TraderReferralCodeState {
  return {
    ...prev,
    modalOpen: false,
    modalSource: null,
    editMode: false,
    incomingCode: undefined,
    incomingCodeReason: undefined,
    previousVerification: undefined,
    pendingVerificationRequest: undefined,
  }
}

export function reduceSetInputCode(prev: TraderReferralCodeState, value: string): TraderReferralCodeState {
  const sanitized = sanitizeReferralCode(value)

  return {
    ...prev,
    inputCode: sanitized,
    verification: prev.verification.kind === 'pending' ? prev.verification : { kind: 'idle' },
  }
}

export const reduceEnableEditMode = (prev: TraderReferralCodeState): TraderReferralCodeState => ({
  ...prev,
  editMode: true,
})

export const reduceDisableEditMode = (prev: TraderReferralCodeState): TraderReferralCodeState => ({
  ...prev,
  editMode: false,
})

export function reduceSaveCode(prev: TraderReferralCodeState, value: string): TraderReferralCodeState {
  const sanitized = sanitizeReferralCode(value)

  if (!sanitized) {
    return {
      ...prev,
      savedCode: undefined,
      inputCode: '',
      verification: { kind: 'idle' },
      shouldAutoVerify: false,
    }
  }

  return {
    ...prev,
    inputCode: sanitized,
    verification: { kind: 'pending', code: sanitized },
    editMode: false,
    shouldAutoVerify: true,
    previousVerification: undefined,
  }
}

export const reduceRemoveCode = (prev: TraderReferralCodeState): TraderReferralCodeState => ({
  ...prev,
  savedCode: undefined,
  inputCode: '',
  incomingCode: undefined,
  incomingCodeReason: undefined,
  previousVerification: undefined,
  verification: { kind: 'idle' },
  shouldAutoVerify: false,
})

export const reduceSetIncomingCode = (prev: TraderReferralCodeState, code?: string): TraderReferralCodeState => ({
  ...prev,
  incomingCode: code ? sanitizeReferralCode(code) : undefined,
  incomingCodeReason: undefined,
})

export const reduceSetIncomingCodeReason = (
  prev: TraderReferralCodeState,
  reason?: TraderReferralCodeIncomingReason,
): TraderReferralCodeState => ({
  ...prev,
  incomingCodeReason: reason,
})

export const reduceSetWalletState = (
  prev: TraderReferralCodeState,
  walletState: TraderWalletReferralCodeState,
): TraderReferralCodeState => ({
  ...prev,
  wallet: walletState,
})

export function reduceStartVerification(prev: TraderReferralCodeState, code: string): TraderReferralCodeState {
  const sanitized = sanitizeReferralCode(code)

  if (!sanitized) {
    return prev
  }

  return {
    ...prev,
    verification: { kind: 'checking', code: sanitized },
    shouldAutoVerify: false,
    lastVerificationRequest: { code: sanitized, timestamp: Date.now() },
  }
}

export const reduceCompleteVerification = (
  prev: TraderReferralCodeState,
  status: TraderReferralCodeVerificationStatus,
): TraderReferralCodeState => ({
  ...prev,
  verification: status,
  previousVerification: undefined,
  shouldAutoVerify: false,
})

export const reduceSetShouldAutoVerify = (prev: TraderReferralCodeState, value: boolean): TraderReferralCodeState => ({
  ...prev,
  shouldAutoVerify: value,
})

export function reduceSetSavedCode(prev: TraderReferralCodeState, value?: string): TraderReferralCodeState {
  const sanitized = value ? sanitizeReferralCode(value) : undefined

  if (!sanitized) {
    return {
      ...prev,
      savedCode: undefined,
      inputCode: '',
      verification: { kind: 'idle' },
      shouldAutoVerify: false,
      previousVerification: undefined,
    }
  }

  return {
    ...prev,
    savedCode: sanitized,
    inputCode: sanitized,
    verification: { kind: 'pending', code: sanitized },
    shouldAutoVerify: true,
    previousVerification: undefined,
  }
}

export const reduceRequestVerification = (prev: TraderReferralCodeState, code?: string): TraderReferralCodeState => ({
  ...prev,
  pendingVerificationRequest: { id: Date.now(), code: code ? sanitizeReferralCode(code) : undefined },
  shouldAutoVerify: false,
})

export const reduceClearPendingVerification = (prev: TraderReferralCodeState, id: number): TraderReferralCodeState => {
  if (prev.pendingVerificationRequest?.id !== id) {
    return prev
  }

  return {
    ...prev,
    pendingVerificationRequest: undefined,
  }
}
