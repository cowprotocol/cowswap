import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { AccountType } from '@cowprotocol/types'

import {
  TwapDemandAnalyticsEvent,
  TwapDemandWalletType,
  TwapEncounterCountBucket,
  TwapSellAmountUsdBucket,
} from './twapDemandAnalytics.types'
import {
  getAndIncrementTwapUnsupportedWalletEncounterCountBucket,
  getHasTwapFormInput,
  getIsTwapDemandWalletTypePending,
  getIsTwapInterestRegistered,
  getTwapDemandSessionStorageKey,
  getTwapDemandWalletType,
  getTwapEncounterCountBucket,
  getTwapSellAmountUsdBucket,
  markTwapDemandEventTrackedInSession,
  registerTwapInterest,
} from './twapDemandAnalytics.utils'

const ACCOUNT = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const USDC = new Token(SupportedChainId.MAINNET, ACCOUNT, 6, 'USDC', 'USD Coin')

function usdAmount(amount: number): CurrencyAmount<Token> {
  return CurrencyAmount.fromRawAmount(USDC, Math.trunc(amount * 1_000_000).toString())
}

describe('twapDemandAnalytics utils', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  describe('getTwapSellAmountUsdBucket', () => {
    it('buckets USD amounts without exposing precise values', () => {
      expect(getTwapSellAmountUsdBucket(null)).toBe(TwapSellAmountUsdBucket.NONE)
      expect(getTwapSellAmountUsdBucket(usdAmount(999))).toBe(TwapSellAmountUsdBucket.LT_1K)
      expect(getTwapSellAmountUsdBucket(usdAmount(1_000))).toBe(TwapSellAmountUsdBucket.FROM_1K_TO_10K)
      expect(getTwapSellAmountUsdBucket(usdAmount(10_000))).toBe(TwapSellAmountUsdBucket.FROM_10K_TO_100K)
      expect(getTwapSellAmountUsdBucket(usdAmount(100_000))).toBe(TwapSellAmountUsdBucket.GT_100K)
    })
  })

  describe('getHasTwapFormInput', () => {
    it('returns true only when at least one form amount is non-zero', () => {
      expect(getHasTwapFormInput(null, undefined)).toBe(false)
      expect(getHasTwapFormInput(usdAmount(0), usdAmount(0))).toBe(false)
      expect(getHasTwapFormInput(usdAmount(1), usdAmount(0))).toBe(true)
    })
  })

  describe('encounter count storage', () => {
    it('increments locally and returns only a bucket', () => {
      expect(getAndIncrementTwapUnsupportedWalletEncounterCountBucket(ACCOUNT)).toBe(TwapEncounterCountBucket.ONE)
      expect(getAndIncrementTwapUnsupportedWalletEncounterCountBucket(ACCOUNT)).toBe(
        TwapEncounterCountBucket.TWO_TO_THREE,
      )
      expect(getAndIncrementTwapUnsupportedWalletEncounterCountBucket(ACCOUNT)).toBe(
        TwapEncounterCountBucket.TWO_TO_THREE,
      )
      expect(getAndIncrementTwapUnsupportedWalletEncounterCountBucket(ACCOUNT)).toBe(
        TwapEncounterCountBucket.FOUR_TO_SEVEN,
      )
      expect(getAndIncrementTwapUnsupportedWalletEncounterCountBucket(ACCOUNT)).toBe(
        TwapEncounterCountBucket.FOUR_TO_SEVEN,
      )
      expect(getAndIncrementTwapUnsupportedWalletEncounterCountBucket(ACCOUNT)).toBe(
        TwapEncounterCountBucket.FOUR_TO_SEVEN,
      )
      expect(getAndIncrementTwapUnsupportedWalletEncounterCountBucket(ACCOUNT)).toBe(
        TwapEncounterCountBucket.FOUR_TO_SEVEN,
      )
      expect(getAndIncrementTwapUnsupportedWalletEncounterCountBucket(ACCOUNT)).toBe(
        TwapEncounterCountBucket.EIGHT_PLUS,
      )
    })

    it('buckets encounter counts', () => {
      expect(getTwapEncounterCountBucket(1)).toBe(TwapEncounterCountBucket.ONE)
      expect(getTwapEncounterCountBucket(3)).toBe(TwapEncounterCountBucket.TWO_TO_THREE)
      expect(getTwapEncounterCountBucket(4)).toBe(TwapEncounterCountBucket.FOUR_TO_SEVEN)
      expect(getTwapEncounterCountBucket(7)).toBe(TwapEncounterCountBucket.FOUR_TO_SEVEN)
      expect(getTwapEncounterCountBucket(8)).toBe(TwapEncounterCountBucket.EIGHT_PLUS)
    })
  })

  describe('session dedupe storage', () => {
    it('marks an event once per session key', () => {
      const storageKey = getTwapDemandSessionStorageKey(TwapDemandAnalyticsEvent.UNSUPPORTED_WALLET_SHOWN, ACCOUNT)

      expect(markTwapDemandEventTrackedInSession(storageKey)).toBe(true)
      expect(markTwapDemandEventTrackedInSession(storageKey)).toBe(false)
    })
  })

  describe('interest storage', () => {
    it('persists registered interest per account', () => {
      expect(getIsTwapInterestRegistered(ACCOUNT)).toBe(false)

      registerTwapInterest(ACCOUNT)

      expect(getIsTwapInterestRegistered(ACCOUNT)).toBe(true)
    })
  })

  describe('getTwapDemandWalletType', () => {
    it('classifies unsupported wallet types using existing wallet signals', () => {
      expect(
        getTwapDemandWalletType({
          account: ACCOUNT,
          accountType: AccountType.EOA,
          isSafeViaWc: false,
          isSafeWallet: false,
          isSmartContractWallet: false,
        }),
      ).toBe(TwapDemandWalletType.EOA)

      expect(
        getTwapDemandWalletType({
          account: ACCOUNT,
          accountType: AccountType.SMART_CONTRACT,
          isSafeViaWc: false,
          isSafeWallet: false,
          isSmartContractWallet: true,
        }),
      ).toBe(TwapDemandWalletType.OTHER_SMART_CONTRACT)

      expect(
        getTwapDemandWalletType({
          account: ACCOUNT,
          accountType: AccountType.SMART_CONTRACT,
          isSafeViaWc: true,
          isSafeWallet: false,
          isSmartContractWallet: true,
        }),
      ).toBe(TwapDemandWalletType.SAFE_VIA_WC)

      expect(
        getTwapDemandWalletType({
          account: ACCOUNT,
          accountType: AccountType.EOA,
          isSafeViaWc: true,
          isSafeWallet: false,
          isSmartContractWallet: false,
        }),
      ).toBe(TwapDemandWalletType.SAFE_UNDEPLOYED)
    })
  })

  describe('getIsTwapDemandWalletTypePending', () => {
    it('waits for account type before classifying non-Safe wallets', () => {
      expect(
        getIsTwapDemandWalletTypePending({
          account: ACCOUNT,
          accountType: undefined,
          isSafeViaWc: false,
          isSafeWallet: false,
          isSmartContractWallet: undefined,
        }),
      ).toBe(true)

      expect(
        getIsTwapDemandWalletTypePending({
          account: ACCOUNT,
          accountType: AccountType.EOA,
          isSafeViaWc: false,
          isSafeWallet: false,
          isSmartContractWallet: false,
        }),
      ).toBe(false)
    })

    it('waits for account type before splitting Safe via WalletConnect from undeployed Safe', () => {
      expect(
        getIsTwapDemandWalletTypePending({
          account: ACCOUNT,
          accountType: undefined,
          isSafeViaWc: true,
          isSafeWallet: false,
          isSmartContractWallet: undefined,
        }),
      ).toBe(true)

      expect(
        getIsTwapDemandWalletTypePending({
          account: ACCOUNT,
          accountType: AccountType.SMART_CONTRACT,
          isSafeViaWc: true,
          isSafeWallet: false,
          isSmartContractWallet: true,
        }),
      ).toBe(false)
    })
  })
})
