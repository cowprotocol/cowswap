import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import {
  AFFILIATE_PAYOUT_ADDRESS_CONFIRMATION_STORAGE_KEY,
  AFFILIATE_TRADER_STORAGE_KEY,
} from '../config/affiliateProgram.const'
import { AffiliateTraderState } from '../lib/affiliateProgramTypes'
import { formatRefCode } from '../lib/affiliateProgramUtils'

export const affiliateTraderStateAtom = atom<AffiliateTraderState>({
  modalOpen: false,
  editMode: false,
  code: '',
  codeOrigin: 'none',
  verificationStatus: 'idle',
  verificationEligible: undefined,
  verificationProgramParams: undefined,
  verificationErrorMessage: undefined,
})

export const affiliateTraderStoredCodeAtom = atomWithStorage<string | undefined>(
  AFFILIATE_TRADER_STORAGE_KEY,
  undefined,
  undefined,
  { getOnInit: true },
)

export type AffiliateTraderWithSavedCode = AffiliateTraderState & { savedCode?: string }
export const affiliateTraderAtom = atom<AffiliateTraderWithSavedCode>((get) => {
  const state = get(affiliateTraderStateAtom)
  const storedCode = get(affiliateTraderStoredCodeAtom)
  const savedCode = storedCode ? formatRefCode(storedCode) : undefined

  return {
    ...state,
    savedCode,
  }
})

export type PayoutAddressConfirmationByWallet = Record<string, boolean>
export const payoutAddressConfirmationAtom = atomWithStorage<PayoutAddressConfirmationByWallet>(
  AFFILIATE_PAYOUT_ADDRESS_CONFIRMATION_STORAGE_KEY,
  {},
  getJotaiIsolatedStorage(),
)
