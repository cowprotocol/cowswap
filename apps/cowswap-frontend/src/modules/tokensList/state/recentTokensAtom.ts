import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import {
  RECENT_TOKENS_LIMIT,
  RECENT_TOKENS_STORAGE_KEY,
  normalizeStoredRecentTokens,
  type StoredRecentTokensByChain,
} from '../hooks/recentTokensStorage'

function getRecentTokensStorage(): ReturnType<typeof getJotaiIsolatedStorage<StoredRecentTokensByChain>> {
  const storage = getJotaiIsolatedStorage<StoredRecentTokensByChain>()
  const originalGetItem = storage.getItem.bind(storage)

  const getItem = (key: string, initialValue: StoredRecentTokensByChain): StoredRecentTokensByChain => {
    const stored = originalGetItem(key, initialValue)
    return normalizeStoredRecentTokens(stored, RECENT_TOKENS_LIMIT)
  }

  return { ...storage, getItem }
}

export const recentTokensAtom = atomWithStorage<StoredRecentTokensByChain>(
  RECENT_TOKENS_STORAGE_KEY,
  {} as StoredRecentTokensByChain,
  getRecentTokensStorage(),
  { unstable_getOnInit: true },
)
