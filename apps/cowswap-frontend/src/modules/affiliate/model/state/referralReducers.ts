import { sanitizeReferralCode } from '../../lib/code'
import {
  ReferralDomainState,
  ReferralIncomingCodeReason,
  ReferralModalSource,
  ReferralVerificationStatus,
  WalletReferralState,
} from '../types'

export function reduceOpenModal(
  prev: ReferralDomainState,
  source: ReferralModalSource,
  options?: { code?: string },
): ReferralDomainState {
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

function resolveInputCode(prev: ReferralDomainState, sanitizedIncoming: string | undefined, isLinked: boolean): string {
  const candidate = isLinked
    ? prev.savedCode || prev.inputCode || ''
    : (sanitizedIncoming ?? prev.inputCode ?? prev.savedCode ?? '')

  return sanitizeReferralCode(candidate) ?? ''
}

function resolveVerification(
  prev: ReferralDomainState,
  sanitizedIncoming: string | undefined,
  isLinked: boolean,
): ReferralDomainState['verification'] {
  if (!sanitizedIncoming || sanitizedIncoming === prev.savedCode || isLinked) {
    return prev.verification
  }

  return { kind: 'pending', code: sanitizedIncoming }
}

export function reduceCloseModal(prev: ReferralDomainState): ReferralDomainState {
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

export function reduceSetInputCode(prev: ReferralDomainState, value: string): ReferralDomainState {
  const sanitized = sanitizeReferralCode(value)

  return {
    ...prev,
    inputCode: sanitized,
    verification: prev.verification.kind === 'pending' ? prev.verification : { kind: 'idle' },
  }
}

export const reduceEnableEditMode = (prev: ReferralDomainState): ReferralDomainState => ({
  ...prev,
  editMode: true,
})

export const reduceDisableEditMode = (prev: ReferralDomainState): ReferralDomainState => ({
  ...prev,
  editMode: false,
})

export function reduceSaveCode(prev: ReferralDomainState, value: string): ReferralDomainState {
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

export const reduceRemoveCode = (prev: ReferralDomainState): ReferralDomainState => ({
  ...prev,
  savedCode: undefined,
  inputCode: '',
  incomingCode: undefined,
  incomingCodeReason: undefined,
  previousVerification: undefined,
  verification: { kind: 'idle' },
  shouldAutoVerify: false,
})

export const reduceSetIncomingCode = (prev: ReferralDomainState, code?: string): ReferralDomainState => ({
  ...prev,
  incomingCode: code ? sanitizeReferralCode(code) : undefined,
  incomingCodeReason: undefined,
})

export const reduceSetIncomingCodeReason = (
  prev: ReferralDomainState,
  reason?: ReferralIncomingCodeReason,
): ReferralDomainState => ({
  ...prev,
  incomingCodeReason: reason,
})

export const reduceSetWalletState = (
  prev: ReferralDomainState,
  walletState: WalletReferralState,
): ReferralDomainState => ({
  ...prev,
  wallet: walletState,
})

export function reduceStartVerification(prev: ReferralDomainState, code: string): ReferralDomainState {
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
  prev: ReferralDomainState,
  status: ReferralVerificationStatus,
): ReferralDomainState => ({
  ...prev,
  verification: status,
  previousVerification: undefined,
  shouldAutoVerify: false,
})

export const reduceSetShouldAutoVerify = (prev: ReferralDomainState, value: boolean): ReferralDomainState => ({
  ...prev,
  shouldAutoVerify: value,
})

export function reduceSetSavedCode(prev: ReferralDomainState, value?: string): ReferralDomainState {
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

export const reduceRequestVerification = (prev: ReferralDomainState, code?: string): ReferralDomainState => ({
  ...prev,
  pendingVerificationRequest: { id: Date.now(), code: code ? sanitizeReferralCode(code) : undefined },
  shouldAutoVerify: false,
})

export const reduceClearPendingVerification = (prev: ReferralDomainState, id: number): ReferralDomainState => {
  if (prev.pendingVerificationRequest?.id !== id) {
    return prev
  }

  return {
    ...prev,
    pendingVerificationRequest: undefined,
  }
}
