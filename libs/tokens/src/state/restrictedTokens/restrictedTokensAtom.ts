import { atom } from 'jotai'

import { getTokenId, TokenId } from '@cowprotocol/common-utils'
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

export const restrictedTokensAtom = atom<RestrictedTokenListState>(initialState)
