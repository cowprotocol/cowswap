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
  { getOnInit: true },
)

/**
 * maps token list source url to their blocked countries and consent hashes
 * used to hide entire token lists for users in blocked countries
 */
export interface RestrictedListsState {
  blockedCountriesPerList: Record<string, string[]>
  consentHashPerList: Record<string, string>
  isLoaded: boolean
}

const initialRestrictedListsState: RestrictedListsState = {
  blockedCountriesPerList: {},
  consentHashPerList: {},
  isLoaded: false,
}

export const restrictedListsAtom = atom<RestrictedListsState>(initialRestrictedListsState)
