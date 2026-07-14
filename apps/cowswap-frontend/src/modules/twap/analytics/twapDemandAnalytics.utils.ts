import { isFractionFalsy } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { AccountType } from '@cowprotocol/types'

import {
  TwapDemandAnalyticsEvent,
  TwapDemandWalletType,
  TwapEncounterCountBucket,
  TwapSellAmountUsdBucket,
} from './twapDemandAnalytics.types'

const UNKNOWN_ACCOUNT_KEY = 'unknown'
const SESSION_STORAGE_PREFIX = 'twap-demand-analytics:session:v1'
const ENCOUNTER_COUNT_STORAGE_PREFIX = 'twap-demand-analytics:unsupported-wallet-encounters:v1'
const INTEREST_STORAGE_PREFIX = 'twap-demand-analytics:interest:v1'

type BrowserStorageName = 'localStorage' | 'sessionStorage'

export interface GetTwapDemandWalletTypeParams {
  account?: string
  accountType: AccountType | undefined
  isSafeViaWc: boolean
  isSafeWallet: boolean
  isSmartContractWallet: boolean | undefined
}

export function getTwapDemandWalletType(params: GetTwapDemandWalletTypeParams): TwapDemandWalletType {
  const { account, accountType, isSafeViaWc, isSafeWallet, isSmartContractWallet } = params

  if (!account) return TwapDemandWalletType.UNKNOWN

  if (isSafeViaWc) {
    return accountType === AccountType.EOA ? TwapDemandWalletType.SAFE_UNDEPLOYED : TwapDemandWalletType.SAFE_VIA_WC
  }

  if (isSafeWallet) return TwapDemandWalletType.UNKNOWN
  if (accountType === AccountType.EOA) return TwapDemandWalletType.EOA

  if (
    accountType === AccountType.SMART_CONTRACT ||
    accountType === AccountType.EIP7702EOA ||
    isSmartContractWallet === true
  ) {
    return TwapDemandWalletType.OTHER_SMART_CONTRACT
  }

  return TwapDemandWalletType.UNKNOWN
}

export function getIsTwapDemandWalletTypePending(params: GetTwapDemandWalletTypeParams): boolean {
  const { account, accountType, isSafeViaWc, isSafeWallet } = params

  if (!account) return false
  if (isSafeWallet) return false
  if (isSafeViaWc) return accountType === undefined

  return accountType === undefined
}

export function getHasTwapFormInput(
  inputAmount: CurrencyAmount<Currency> | null | undefined,
  outputAmount: CurrencyAmount<Currency> | null | undefined,
): boolean {
  return !isFractionFalsy(inputAmount) || !isFractionFalsy(outputAmount)
}

export function getTwapSellAmountUsdBucket(
  sellAmountUsd: CurrencyAmount<Currency> | null | undefined,
): TwapSellAmountUsdBucket {
  const amount = sellAmountUsd ? Number(sellAmountUsd.toExact()) : 0

  if (!Number.isFinite(amount) || amount <= 0) return TwapSellAmountUsdBucket.NONE
  if (amount < 1_000) return TwapSellAmountUsdBucket.LT_1K
  if (amount < 10_000) return TwapSellAmountUsdBucket.FROM_1K_TO_10K
  if (amount < 100_000) return TwapSellAmountUsdBucket.FROM_10K_TO_100K

  return TwapSellAmountUsdBucket.GT_100K
}

export function getTwapEncounterCountBucket(encounterCount: number): TwapEncounterCountBucket {
  if (encounterCount <= 1) return TwapEncounterCountBucket.ONE
  if (encounterCount <= 3) return TwapEncounterCountBucket.TWO_TO_THREE
  if (encounterCount <= 7) return TwapEncounterCountBucket.FOUR_TO_SEVEN

  return TwapEncounterCountBucket.EIGHT_PLUS
}

export function getTwapDemandSessionStorageKey(action: TwapDemandAnalyticsEvent, account?: string): string {
  return `${SESSION_STORAGE_PREFIX}:${action}:${getTwapDemandAccountKey(account)}`
}

export function markTwapDemandEventTrackedInSession(storageKey: string): boolean {
  const storage = getBrowserStorage('sessionStorage')

  if (!storage) return true
  if (storage.getItem(storageKey)) return false

  storage.setItem(storageKey, '1')

  return true
}

export function getAndIncrementTwapUnsupportedWalletEncounterCountBucket(account?: string): TwapEncounterCountBucket {
  const storage = getBrowserStorage('localStorage')

  if (!storage) return TwapEncounterCountBucket.ONE

  const key = `${ENCOUNTER_COUNT_STORAGE_PREFIX}:${getTwapDemandAccountKey(account)}`
  const encounterCount = getStoredCount(storage, key) + 1

  storage.setItem(key, encounterCount.toString())

  return getTwapEncounterCountBucket(encounterCount)
}

export function getIsTwapInterestRegistered(account?: string): boolean {
  const storage = getBrowserStorage('localStorage')

  if (!storage) return false

  return storage.getItem(getTwapInterestStorageKey(account)) === '1'
}

export function registerTwapInterest(account?: string): void {
  const storage = getBrowserStorage('localStorage')

  if (!storage) return

  storage.setItem(getTwapInterestStorageKey(account), '1')
}

function getTwapDemandAccountKey(account?: string): string {
  return account ? getAddressKey(account) : UNKNOWN_ACCOUNT_KEY
}

function getTwapInterestStorageKey(account?: string): string {
  return `${INTEREST_STORAGE_PREFIX}:${getTwapDemandAccountKey(account)}`
}

function getStoredCount(storage: Storage, key: string): number {
  const storedValue = storage.getItem(key)
  const parsedValue = storedValue ? Number.parseInt(storedValue, 10) : 0

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0
}

function getBrowserStorage(storageName: BrowserStorageName): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window[storageName]
  } catch {
    return null
  }
}
