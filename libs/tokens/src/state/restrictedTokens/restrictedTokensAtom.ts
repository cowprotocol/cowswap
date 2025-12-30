import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getTokenId, TokenId } from '@cowprotocol/common-utils'
import { atomWithIdbStorage, getJotaiMergerStorage } from '@cowprotocol/core'
import { TokenInfo } from '@cowprotocol/types'

export { getTokenId }
export type { TokenId }

export interface RestrictedTokenListState {
  tokensMap: Record<TokenId, TokenInfo>
  countriesPerToken: Record<TokenId, string[]>
  consentHashPerToken: Record<TokenId, string>
  isLoaded: boolean
}

const initialState: RestrictedTokenListState = {
  tokensMap: {},
  countriesPerToken: {},
  consentHashPerToken: {},
  isLoaded: false,
}

/**
 * Persisted cache in IndexedDB - loaded asynchronously on app start
 */
export const restrictedTokensCacheAtom = atomWithIdbStorage<RestrictedTokenListState>(
  'restrictedTokens:v1',
  initialState,
)

/**
 * Runtime state for synchronous access by hooks.
 * Populated from cache on mount, updated by the updater.
 */
export const restrictedTokensAtom = atom<RestrictedTokenListState>(initialState)

export const restrictedTokensLastUpdateAtom = atomWithStorage<number>(
  'restrictedTokens:lastUpdate:v1',
  0,
  getJotaiMergerStorage(),
  { unstable_getOnInit: true },
)
