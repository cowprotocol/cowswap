import { createStore } from 'jotai'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { type WalletInfo, walletInfoAtom } from '@cowprotocol/wallet'

import { affiliateTraderSavedCodeAtom, setAffiliateTraderSavedCodeAtom } from './affiliateTraderSavedCodeAtom'
import { affiliateTraderSavedCodeStorage } from './migrations/affiliateTraderSavedCodeStorage.utils'

import { AffiliateCodeSource } from '../analytics/affiliateAnalytics.types'
import {
  AFFILIATE_TRADER_SAVED_CODES_LEGACY_STORAGE_KEY,
  AFFILIATE_TRADER_SAVED_CODES_STORAGE_KEY,
} from '../config/affiliateProgram.const'

const WALLET_A = '0x1111111111111111111111111111111111111111'
const WALLET_B = '0x2222222222222222222222222222222222222222'

function createWalletInfo(account: string): WalletInfo {
  return {
    account,
    active: true,
    chainId: 1,
  }
}

describe('affiliateTraderSavedCodeAtom', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores trader codes per normalized wallet key', () => {
    const store = createStore()
    store.set(walletInfoAtom, createWalletInfo(WALLET_A))

    store.set(setAffiliateTraderSavedCodeAtom, {
      savedCode: 'COW-123',
      isLinked: false,
      source: AffiliateCodeSource.MANUAL_INPUT,
    })

    expect(store.get(affiliateTraderSavedCodeAtom)).toEqual({
      savedCode: 'COW-123',
      isLinked: false,
      source: AffiliateCodeSource.MANUAL_INPUT,
    })
    expect(JSON.parse(localStorage.getItem(AFFILIATE_TRADER_SAVED_CODES_STORAGE_KEY) || '{}')).toEqual({
      [getAddressKey(WALLET_A)]: {
        savedCode: 'COW-123',
        isLinked: false,
        source: AffiliateCodeSource.MANUAL_INPUT,
      },
    })
  })

  it('keeps saved codes scoped to the connected wallet', () => {
    const store = createStore()

    store.set(walletInfoAtom, createWalletInfo(WALLET_A))
    store.set(setAffiliateTraderSavedCodeAtom, {
      savedCode: 'ALPHA1',
      isLinked: false,
      source: AffiliateCodeSource.MANUAL_INPUT,
    })

    store.set(walletInfoAtom, createWalletInfo(WALLET_B))
    store.set(setAffiliateTraderSavedCodeAtom, {
      savedCode: 'BETA22',
      isLinked: true,
      source: AffiliateCodeSource.ORDERBOOK_RECOVERY,
    })

    expect(store.get(affiliateTraderSavedCodeAtom)).toEqual({
      savedCode: 'BETA22',
      isLinked: true,
      source: AffiliateCodeSource.ORDERBOOK_RECOVERY,
    })

    store.set(walletInfoAtom, createWalletInfo(WALLET_A))

    expect(store.get(affiliateTraderSavedCodeAtom)).toEqual({
      savedCode: 'ALPHA1',
      isLinked: false,
      source: AffiliateCodeSource.MANUAL_INPUT,
    })
  })

  it('removes the current wallet entry when the saved code is cleared', () => {
    const store = createStore()
    store.set(walletInfoAtom, createWalletInfo(WALLET_A))
    store.set(setAffiliateTraderSavedCodeAtom, {
      savedCode: 'ALPHA1',
      isLinked: false,
      source: AffiliateCodeSource.MANUAL_INPUT,
    })

    store.set(setAffiliateTraderSavedCodeAtom, undefined)

    expect(store.get(affiliateTraderSavedCodeAtom)).toEqual({})
    expect(localStorage.getItem(AFFILIATE_TRADER_SAVED_CODES_STORAGE_KEY)).toBe('{}')
  })

  it('migrates legacy storage and backfills the missing source', () => {
    localStorage.setItem(
      AFFILIATE_TRADER_SAVED_CODES_LEGACY_STORAGE_KEY,
      JSON.stringify({
        [WALLET_A.toLowerCase()]: {
          savedCode: 'cow-123',
          isLinked: true,
        },
      }),
    )

    expect(affiliateTraderSavedCodeStorage.getItem(AFFILIATE_TRADER_SAVED_CODES_STORAGE_KEY, {})).toEqual({
      [getAddressKey(WALLET_A)]: {
        savedCode: 'COW-123',
        isLinked: true,
        source: AffiliateCodeSource.LEGACY_UNKNOWN,
      },
    })
    expect(localStorage.getItem(AFFILIATE_TRADER_SAVED_CODES_LEGACY_STORAGE_KEY)).toBeNull()
    expect(JSON.parse(localStorage.getItem(AFFILIATE_TRADER_SAVED_CODES_STORAGE_KEY) || '{}')).toEqual({
      [getAddressKey(WALLET_A)]: {
        savedCode: 'COW-123',
        isLinked: true,
        source: AffiliateCodeSource.LEGACY_UNKNOWN,
      },
    })
  })
})
