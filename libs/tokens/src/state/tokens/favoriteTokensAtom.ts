import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getJotaiMergerStorage } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_FAVORITE_TOKENS } from '../../const/defaultFavoriteTokens'
import { TokensMap } from '../../types'
import { environmentAtom } from '../environmentAtom'


export const favoriteTokensAtom = atomWithStorage<Record<SupportedChainId, TokensMap>>(
  'favouriteTokensAtom:v1',
  DEFAULT_FAVORITE_TOKENS,
  getJotaiMergerStorage()
)

export const favoriteTokensListAtom = atom((get) => {
  const { chainId } = get(environmentAtom)
  const favoriteTokensState = get(favoriteTokensAtom)

  return Object.values(favoriteTokensState[chainId]).map((token) => TokenWithLogo.fromToken(token, token.logoURI))
})

export const resetFavoriteTokensAtom = atom(null, (get, set) => {
  set(favoriteTokensAtom, { ...DEFAULT_FAVORITE_TOKENS })
})

export const toggleFavoriteTokenAtom = atom(null, (get, set, token: TokenWithLogo) => {
  const { chainId } = get(environmentAtom)
  const favoriteTokensState = get(favoriteTokensAtom)
  const state = { ...favoriteTokensState[chainId] }
  const tokenKey = token.address.toLowerCase()

  if (state[tokenKey]) {
    delete state[tokenKey]
  } else {
    state[tokenKey] = { ...token, name: token.name || '', symbol: token.symbol || '' }
  }

  set(favoriteTokensAtom, {
    ...favoriteTokensState,
    [chainId]: state,
  })
})
