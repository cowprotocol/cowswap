import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { walletInfoAtom } from '@cowprotocol/wallet'

import { AFFILIATE_TRADER_PAYOUT_CONFIRMATIONS_STORAGE_KEY } from '../config/affiliateProgram.const'

export type AffiliateTraderPayoutConfirmation = Record<string, boolean>

const affiliateTraderPayoutConfirmationByWalletAtom = atomWithStorage<AffiliateTraderPayoutConfirmation>(
  AFFILIATE_TRADER_PAYOUT_CONFIRMATIONS_STORAGE_KEY,
  {},
)

export const setAffiliateTraderPayoutConfirmationAtom = atom(null, (get, set, isConfirmed: boolean): void => {
  const { account } = get(walletInfoAtom)
  if (!account) return

  set(affiliateTraderPayoutConfirmationByWalletAtom, (prev) => ({
    ...prev,
    [account]: isConfirmed,
  }))
})

export const affiliateTraderPayoutConfirmationAtom = atom<boolean>((get) => {
  const { account } = get(walletInfoAtom)
  if (!account) return false

  const confirmedByWallet = get(affiliateTraderPayoutConfirmationByWalletAtom)
  return !!confirmedByWallet[account]
})
