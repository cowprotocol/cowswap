import { useMemo } from 'react'

import { useReferral } from './useReferral'

import { isReferralCodeLengthValid } from '../../lib/code'

export type ReferralModalUiState =
  | 'empty'
  | 'editing'
  | 'pending'
  | 'unsupported'
  | 'checking'
  | 'invalid'
  | 'expired'
  | 'valid'
  | 'linked'
  | 'ineligible'
  | 'error'

type ReferralSnapshot = ReturnType<typeof useReferral>

interface ReferralModalState {
  referral: ReferralSnapshot
  uiState: ReferralModalUiState
  displayCode: string
  savedCode?: string
  inputCode: string
  incomingCode?: string
  hasCode: boolean
  hasValidLength: boolean
  isEditing: boolean
  shouldAutoVerify: boolean
  verification: ReferralSnapshot['verification']
  wallet: ReferralSnapshot['wallet']
}

type ReferralVerificationKind = ReferralSnapshot['verification']['kind']
type ReferralWalletStatus = ReferralSnapshot['wallet']['status']

export function useReferralModalState(): ReferralModalState {
  const referral = useReferral()

  return useMemo(() => buildReferralModalState(referral), [referral])
}

function buildReferralModalState(referral: ReferralSnapshot): ReferralModalState {
  const { inputCode, savedCode, verification, wallet, editMode, incomingCode, shouldAutoVerify } = referral
  const verificationCode = 'code' in verification ? verification.code : undefined
  // Prefer the code the user is actively verifying (incoming/verification) so the UI
  // reflects what the backend is checking even if a different value lives in storage.
  const displayCode = editMode ? inputCode : (verificationCode ?? savedCode ?? inputCode)
  const hasCode = hasAnyCode(verificationCode, incomingCode, savedCode, inputCode)
  const hasValidLength = isReferralCodeLengthValid(displayCode || '')
  const isEditing = editMode || (!savedCode && hasCode)
  const uiState = deriveUiState({
    verificationKind: verification.kind,
    walletStatus: wallet.status,
    hasCode,
    isEditing,
    editMode,
  })

  return {
    referral,
    uiState,
    displayCode,
    savedCode,
    inputCode,
    incomingCode,
    hasCode,
    hasValidLength,
    isEditing,
    shouldAutoVerify,
    verification,
    wallet,
  }
}

function hasAnyCode(verificationCode?: string, incomingCode?: string, savedCode?: string, inputCode?: string): boolean {
  return Boolean(verificationCode || incomingCode || savedCode || inputCode)
}

interface DeriveUiStateParams {
  verificationKind: ReferralVerificationKind
  walletStatus: ReferralWalletStatus
  hasCode: boolean
  isEditing: boolean
  editMode: boolean
}

function deriveUiState(params: DeriveUiStateParams): ReferralModalUiState {
  const { verificationKind, walletStatus, hasCode, isEditing, editMode } = params

  if (walletStatus === 'unsupported') {
    // Unsupported network trumps every other state so the form/CTA are guaranteed to lock.
    return 'unsupported'
  }

  if (!isEditing && (verificationKind === 'linked' || walletStatus === 'linked')) {
    return 'linked'
  }

  if (editMode && hasCode) {
    return 'editing'
  }

  const stateFromVerification = resolveVerificationState(verificationKind, walletStatus, hasCode)
  if (stateFromVerification) {
    return stateFromVerification
  }

  if (isEditing && hasCode) {
    return 'editing'
  }

  return 'empty'
}

function resolveVerificationState(
  verificationKind: ReferralVerificationKind,
  walletStatus: ReferralWalletStatus,
  hasCode: boolean,
): ReferralModalUiState | null {
  const orderedConditions: Array<[boolean, ReferralModalUiState]> = [
    [verificationKind === 'checking', 'checking'],
    [walletStatus === 'unsupported' && hasCode, 'unsupported'],
    [verificationKind === 'invalid', 'invalid'],
    [verificationKind === 'expired', 'expired'],
    [verificationKind === 'valid', 'valid'],
    [verificationKind === 'ineligible' || walletStatus === 'ineligible', 'ineligible'],
    [verificationKind === 'error', 'error'],
    [verificationKind === 'pending', 'pending'],
  ]

  for (const [condition, state] of orderedConditions) {
    if (condition) {
      return state
    }
  }

  return null
}
