import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import {
  AFFILIATE_PAYOUT_ADDRESS_CONFIRMATION_STORAGE_KEY,
  AFFILIATE_TRADER_STORAGE_KEY,
} from '../config/affiliateProgram.const'
import { AffiliateProgramParams } from '../lib/affiliateProgramTypes'

import type { TraderReferralCodeVerificationStatus } from '../hooks/useAffiliateTraderVerification'

export interface AffiliateTraderInMemoryState {
  modalOpen: boolean
  codeInput: string
  verificationStatus: TraderReferralCodeVerificationStatus
  verificationEligible?: boolean
  verificationProgramParams?: AffiliateProgramParams
  verificationErrorMessage?: string
}

export const affiliateTraderStateAtom = atom<AffiliateTraderInMemoryState>({
  modalOpen: false,
  codeInput: '',
  verificationStatus: 'idle',
  verificationEligible: undefined,
  verificationProgramParams: undefined,
  verificationErrorMessage: undefined,
})

export interface AffiliateTraderStoredState {
  /**
   * Persisted referral code for trader flows, stored after verification success or recovery.
   */
  savedCode?: string
  /**
   * Persisted linkage flag set when code is recovered from trader's fulfilled orders.
   */
  isLinked?: boolean
}

export const affiliateTraderStoredStateAtom = atomWithStorage<AffiliateTraderStoredState | undefined>(
  AFFILIATE_TRADER_STORAGE_KEY,
  undefined,
  undefined,
  { getOnInit: true },
)

export interface AffiliateTraderAtom extends AffiliateTraderInMemoryState, AffiliateTraderStoredState {}

export const affiliateTraderAtom = atom<AffiliateTraderAtom>((get) => {
  const state = get(affiliateTraderStateAtom)
  const storedState = get(affiliateTraderStoredStateAtom)

  return {
    ...state,
    ...storedState,
  }
})

export type PayoutAddressConfirmationByWallet = Record<string, boolean>
export const payoutAddressConfirmationAtom = atomWithStorage<PayoutAddressConfirmationByWallet>(
  AFFILIATE_PAYOUT_ADDRESS_CONFIRMATION_STORAGE_KEY,
  {},
  getJotaiIsolatedStorage(),
)
