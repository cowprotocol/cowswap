import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { affiliateTraderSavedCodeStorage } from './migrations/affiliateTraderSavedCodeStorage.utils'

import { AffiliateCodeSource } from '../analytics/affiliateAnalytics.types'
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
  /**
   * Persisted source describing how the code entered trader state.
   */
  source?: AffiliateCodeSource
}

export type AffiliateTraderSavedCodeByWallet = Record<string, AffiliateTraderSavedCodeState | undefined>

const affiliateTraderSavedCodeByWalletAtom = atomWithStorage<AffiliateTraderSavedCodeByWallet>(
  AFFILIATE_TRADER_SAVED_CODES_STORAGE_KEY,
  {},
  affiliateTraderSavedCodeStorage,
  { getOnInit: true },
)

export const setAffiliateTraderSavedCodeAtom = atom(
  null,
  (get, set, nextState: AffiliateTraderSavedCodeState | undefined) => {
    const { account } = get(walletInfoAtom)
    if (!account) return

    const accountKey = getAddressKey(account)

    set(affiliateTraderSavedCodeByWalletAtom, (prev) => {
      if (!nextState) {
        const { [accountKey]: _deleted, ...rest } = prev
        return rest
      }

      return {
        ...prev,
        [accountKey]: nextState,
      }
    })
  },
)

export const affiliateTraderSavedCodeAtom = atom<AffiliateTraderSavedCodeState>((get) => {
  const { account } = get(walletInfoAtom)
  const storedStateByWallet = get(affiliateTraderSavedCodeByWalletAtom)
  const storedState = account ? storedStateByWallet[getAddressKey(account)] : undefined
  return storedState ?? {}
})
