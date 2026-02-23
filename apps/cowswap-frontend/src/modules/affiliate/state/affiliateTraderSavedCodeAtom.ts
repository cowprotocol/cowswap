import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { walletInfoAtom } from '@cowprotocol/wallet'

import { AFFILIATE_TRADER_SAVED_CODES_STORAGE_KEY } from '../config/affiliateProgram.const'

export interface AffiliateTraderSavedCodeState {
  /**
   * Persisted referral code for trader flows, stored after verification success or recovery.
   */
  savedCode?: string
  /**
   * Persisted linkage flag set when code is recovered from trader's fulfilled orders.
   */
  isLinked?: boolean
}

const affiliateTraderSavedCodeByWalletAtom = atomWithStorage<Record<string, AffiliateTraderSavedCodeState | undefined>>(
  AFFILIATE_TRADER_SAVED_CODES_STORAGE_KEY,
  {},
)

export const setAffiliateTraderSavedCodeAtom = atom(
  null,
  (get, set, nextState: AffiliateTraderSavedCodeState | undefined) => {
    const { account } = get(walletInfoAtom)
    if (!account) return

    set(affiliateTraderSavedCodeByWalletAtom, (prev) => {
      if (!nextState) {
        const { [account]: _deleted, ...rest } = prev
        return rest
      }

      return {
        ...prev,
        [account]: nextState,
      }
    })
  },
)

export const affiliateTraderSavedCodeAtom = atom<AffiliateTraderSavedCodeState>((get) => {
  const { account } = get(walletInfoAtom)
  const storedStateByWallet = get(affiliateTraderSavedCodeByWalletAtom)
  const storedState = account ? storedStateByWallet[account] : undefined
  return storedState ?? {}
})
