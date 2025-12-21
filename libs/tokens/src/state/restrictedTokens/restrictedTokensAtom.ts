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
  tosHashPerToken: Record<TokenId, string>
  isLoaded: boolean
}

const initialState: RestrictedTokenListState = {
  tokensMap: {},
  countriesPerToken: {},
  tosHashPerToken: {},
  isLoaded: false,
}

export const restrictedTokensAtom = atomWithIdbStorage<RestrictedTokenListState>(
  'restrictedTokensAtom:v1',
  initialState,
)

export const setRestrictedTokensAtom = atom(null, (_get, set, listState: RestrictedTokenListState) => {
  set(restrictedTokensAtom, listState)
})

export const restrictedTokensLastUpdateAtom = atomWithStorage<number>(
  'restrictedTokensLastUpdate:v1',
  0,
  getJotaiMergerStorage(),
  { unstable_getOnInit: true },
)
