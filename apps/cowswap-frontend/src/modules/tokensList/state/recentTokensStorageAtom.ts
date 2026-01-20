import { atom } from 'jotai'

import { readStoredTokens, RECENT_TOKENS_LIMIT, StoredRecentTokensByChain } from '../utils/recentTokensStorage'

/**
 * Atom holding the stored recent tokens by chain.
 * Initialized from localStorage on first read.
 */
export const recentTokensStorageAtom = atom<StoredRecentTokensByChain>(readStoredTokens(RECENT_TOKENS_LIMIT))
