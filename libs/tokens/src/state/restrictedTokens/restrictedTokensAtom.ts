import { atom } from 'jotai'

import { TokenInfo } from '@cowprotocol/types'

export type TokenId = `${number}:${string}`

export function getTokenId(chainId: number, address: string): TokenId {
  return `${chainId}:${address.toLowerCase()}`
}

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

export const restrictedTokensAtom = atom<RestrictedTokenListState>(initialState)

export const setRestrictedTokensAtom = atom(null, (_get, set, listState: RestrictedTokenListState) => {
  set(restrictedTokensAtom, listState)
})
