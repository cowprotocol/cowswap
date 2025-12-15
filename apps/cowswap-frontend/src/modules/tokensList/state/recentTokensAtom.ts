import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import {
  RECENT_TOKENS_LIMIT,
  RECENT_TOKENS_STORAGE_KEY,
  normalizeStoredRecentTokens,
  type StoredRecentTokensByChain,
} from '../hooks/recentTokensStorage'

export const recentTokensStoreAtom = atomWithStorage<StoredRecentTokensByChain>(
  RECENT_TOKENS_STORAGE_KEY,
  {},
  getJotaiIsolatedStorage(),
)

function migrateIfNeeded(stored: unknown): StoredRecentTokensByChain {
  return normalizeStoredRecentTokens(stored, RECENT_TOKENS_LIMIT)
}

/**
 * Recent tokens atom that handles serialization/deserialization and migration.
 * The store atom handles persistence automatically via jotai's atomWithStorage.
 */
export const recentTokensAtom = atom(
  (get) => {
    const stored = get(recentTokensStoreAtom)
    return migrateIfNeeded(stored)
  },
  (
    get,
    set,
    updater: StoredRecentTokensByChain | ((state: StoredRecentTokensByChain) => StoredRecentTokensByChain),
  ) => {
    const current = get(recentTokensStoreAtom)
    const migrated = migrateIfNeeded(current)
    const update = typeof updater === 'function' ? updater(migrated) : updater
    set(recentTokensStoreAtom, update)
    return update
  },
)
