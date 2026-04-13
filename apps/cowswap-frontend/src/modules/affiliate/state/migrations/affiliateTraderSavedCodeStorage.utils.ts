import { createJSONStorage } from 'jotai/utils'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { AffiliateCodeSource } from '../../analytics/affiliateAnalytics.types'
import { getAffiliateCodeSourceFallback } from '../../analytics/affiliateAnalytics.utils'
import {
  AFFILIATE_TRADER_SAVED_CODES_LEGACY_STORAGE_KEY,
  AFFILIATE_TRADER_SAVED_CODES_STORAGE_KEY,
} from '../../config/affiliateProgram.const'
import { formatRefCode } from '../../lib/affiliateProgramUtils'

import type { AffiliateTraderSavedCodeByWallet, AffiliateTraderSavedCodeState } from '../affiliateTraderSavedCodeAtom'

const traderSavedCodeStorage = createJSONStorage<AffiliateTraderSavedCodeByWallet>(() => localStorage)

export const affiliateTraderSavedCodeStorage = {
  ...traderSavedCodeStorage,
  getItem(key: string, initialValue: AffiliateTraderSavedCodeByWallet): AffiliateTraderSavedCodeByWallet {
    const currentValue = readSavedCodeState(key)

    if (currentValue) {
      return currentValue
    }

    const legacyValue = readSavedCodeState(AFFILIATE_TRADER_SAVED_CODES_LEGACY_STORAGE_KEY)

    if (!legacyValue) {
      return initialValue
    }

    localStorage.setItem(AFFILIATE_TRADER_SAVED_CODES_STORAGE_KEY, JSON.stringify(legacyValue))
    localStorage.removeItem(AFFILIATE_TRADER_SAVED_CODES_LEGACY_STORAGE_KEY)

    return legacyValue
  },
}

function readSavedCodeState(storageKey: string): AffiliateTraderSavedCodeByWallet | undefined {
  const rawValue = localStorage.getItem(storageKey)

  if (!rawValue) {
    return undefined
  }

  try {
    return normalizeSavedCodeStateByWallet(JSON.parse(rawValue))
  } catch {
    return {}
  }
}

function normalizeSavedCodeStateByWallet(value: unknown): AffiliateTraderSavedCodeByWallet {
  if (!isRecord(value)) {
    return {}
  }

  return Object.entries(value).reduce<AffiliateTraderSavedCodeByWallet>((accumulator, [walletAddress, state]) => {
    const normalizedState = normalizeSavedCodeState(state)

    if (!normalizedState) {
      return accumulator
    }

    accumulator[getAddressKey(walletAddress)] = normalizedState

    return accumulator
  }, {})
}

function normalizeSavedCodeState(value: unknown): AffiliateTraderSavedCodeState | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const savedCode = formatRefCode(readString(value.savedCode))

  if (!savedCode) {
    return undefined
  }

  const isLinked = typeof value.isLinked === 'boolean' ? value.isLinked : false
  const source = isAffiliateCodeSource(value.source) ? value.source : getAffiliateCodeSourceFallback(isLinked)

  return {
    savedCode,
    isLinked,
    source,
  }
}

function isAffiliateCodeSource(value: unknown): value is AffiliateCodeSource {
  return typeof value === 'string' && Object.values(AffiliateCodeSource).includes(value as AffiliateCodeSource)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}
