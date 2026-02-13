import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { TraderWalletStatus } from './useAffiliateTraderWallet'

import { formatRefCode } from '../lib/affiliateProgramUtils'
import { affiliateTraderAtom, AffiliateTraderWithSavedCode } from '../state/affiliateTraderAtom'

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

type TraderReferralCodeSnapshot = AffiliateTraderWithSavedCode

export interface AffiliateTraderModalState extends TraderReferralCodeSnapshot {
  walletStatus: TraderWalletStatus
  uiState: TraderReferralCodeModalUiState
  displayCode: string
  hasCode: boolean
  hasValidLength: boolean
}

export function useAffiliateTraderModalState(walletStatus: TraderWalletStatus): AffiliateTraderModalState {
  const affiliateTrader = useAtomValue(affiliateTraderAtom)

  return useMemo(
    () => buildTraderReferralCodeModalState(affiliateTrader, walletStatus),
    [affiliateTrader, walletStatus],
  )
}

function buildTraderReferralCodeModalState(
  traderReferralCode: TraderReferralCodeSnapshot,
  walletStatus: TraderWalletStatus,
): AffiliateTraderModalState {
  const { inputCode, savedCode, verification, editMode, incomingCode } = traderReferralCode
  const verificationCode = 'code' in verification ? verification.code : undefined
  // Prefer the code the user is actively verifying (incoming/verification) so the UI
  // reflects what the backend is checking even if a different value lives in storage.
  const displayCode = editMode ? inputCode : (verificationCode ?? savedCode ?? inputCode)
  const hasCode = Boolean(verificationCode || incomingCode || savedCode || inputCode)
  const hasValidLength = Boolean(formatRefCode(displayCode))
  const isEditing = editMode || (!savedCode && hasCode)
  const uiState = deriveUiState(verification.kind, walletStatus, hasCode, isEditing, editMode)

  return {
    ...traderReferralCode,
    walletStatus,
    uiState,
    displayCode,
    hasCode,
    hasValidLength,
  }
}

// eslint-disable-next-line complexity
function deriveUiState(
  verificationKind: TraderReferralCodeSnapshot['verification']['kind'],
  walletStatus: TraderWalletStatus,
  hasCode: boolean,
  isEditing: boolean,
  editMode: boolean,
): TraderReferralCodeModalUiState {
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

  switch (verificationKind) {
    case 'checking':
      return 'checking'
    case 'invalid':
      return 'invalid'
    case 'valid':
      return 'valid'
    case 'ineligible':
      return 'ineligible'
    case 'error':
      return 'error'
    case 'pending':
      return 'pending'
    default:
      break
  }

  if (walletStatus === 'ineligible') {
    return 'ineligible'
  }

  if (isEditing && hasCode) {
    return 'editing'
  }

  return 'empty'
}
