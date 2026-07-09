import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

import { TokenId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

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
 * Runtime state for synchronous access by hooks.
 * Populated only by the updater so browser storage cannot become RWA policy truth.
 */
export const restrictedTokensAtom = atom<RestrictedTokenListState>(initialState)

export const RESTRICTED_TOKENS_LAST_UPDATE_KEY = 'restrictedTokens:lastUpdate:v1'
export const restrictedTokensLastUpdateStorage = createJSONStorage<number>(() => localStorage)

export const restrictedTokensLastUpdateAtom = atomWithStorage<number>(
  RESTRICTED_TOKENS_LAST_UPDATE_KEY,
  0,
  restrictedTokensLastUpdateStorage,
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
