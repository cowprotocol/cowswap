import { useMemo } from 'react'

import { useTraderReferralCode } from './useTraderReferralCode'

import { isReferralCodeLengthValid } from '../lib/affiliateProgramUtils'

export type TraderReferralCodeModalUiState =
  | 'empty'
  | 'editing'
  | 'pending'
  | 'unsupported'
  | 'checking'
  | 'invalid'
  | 'valid'
  | 'linked'
  | 'ineligible'
  | 'error'

type TraderReferralCodeSnapshot = ReturnType<typeof useTraderReferralCode>

interface TraderReferralCodeModalState {
  traderReferralCode: TraderReferralCodeSnapshot
  uiState: TraderReferralCodeModalUiState
  displayCode: string
  savedCode?: string
  inputCode: string
  incomingCode?: string
  hasCode: boolean
  hasValidLength: boolean
  isEditing: boolean
  shouldAutoVerify: boolean
  verification: TraderReferralCodeSnapshot['verification']
  wallet: TraderReferralCodeSnapshot['wallet']
}

type TraderReferralCodeVerificationKind = TraderReferralCodeSnapshot['verification']['kind']
type TraderReferralCodeWalletStatus = TraderReferralCodeSnapshot['wallet']['status']

export function useTraderReferralCodeModalState(): TraderReferralCodeModalState {
  const traderReferralCode = useTraderReferralCode()

  return useMemo(() => buildTraderReferralCodeModalState(traderReferralCode), [traderReferralCode])
}

function buildTraderReferralCodeModalState(
  traderReferralCode: TraderReferralCodeSnapshot,
): TraderReferralCodeModalState {
  const { inputCode, savedCode, verification, wallet, editMode, incomingCode, shouldAutoVerify } = traderReferralCode
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
    traderReferralCode,
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
  verificationKind: TraderReferralCodeVerificationKind
  walletStatus: TraderReferralCodeWalletStatus
  hasCode: boolean
  isEditing: boolean
  editMode: boolean
}

function deriveUiState(params: DeriveUiStateParams): TraderReferralCodeModalUiState {
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
  verificationKind: TraderReferralCodeVerificationKind,
  walletStatus: TraderReferralCodeWalletStatus,
  hasCode: boolean,
): TraderReferralCodeModalUiState | null {
  const orderedConditions: Array<[boolean, TraderReferralCodeModalUiState]> = [
    [verificationKind === 'checking', 'checking'],
    [walletStatus === 'unsupported' && hasCode, 'unsupported'],
    [verificationKind === 'invalid', 'invalid'],
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
