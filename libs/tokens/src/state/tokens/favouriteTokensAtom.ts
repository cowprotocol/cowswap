import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokensMap } from '../../types'
import { environmentAtom } from '../environmentAtom'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { DEFAULT_FAVOURITE_TOKENS } from '../../const/defaultFavouriteTokens'
import { tokenWithLogoFromToken } from '../../utils/tokenWithLogoFromToken'

export const favouriteTokensAtom = atomWithStorage<Record<SupportedChainId, TokensMap>>(
  'favouriteTokensAtom:v1',
  DEFAULT_FAVOURITE_TOKENS
)

export const favouriteTokensListAtom = atom((get) => {
  const { chainId } = get(environmentAtom)
  const favouriteTokensState = get(favouriteTokensAtom)

  return Object.values(favouriteTokensState[chainId]).map((token) => tokenWithLogoFromToken(token, token.logoURI))
})

export const resetFavouriteTokensAtom = atom(null, (get, set) => {
  set(favouriteTokensAtom, { ...DEFAULT_FAVOURITE_TOKENS })
})

export const toggleFavouriteTokenAtom = atom(null, (get, set, token: TokenWithLogo) => {
  const { chainId } = get(environmentAtom)
  const favouriteTokensState = get(favouriteTokensAtom)
  const state = { ...favouriteTokensState[chainId] }
  const tokenKey = token.address.toLowerCase()

  if (state[tokenKey]) {
    delete state[tokenKey]
  } else {
    state[tokenKey] = { ...token, name: token.name || '', symbol: token.symbol || '' }
  }

  set(favouriteTokensAtom, {
    ...favouriteTokensState,
    [chainId]: state,
  })
})
