import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { TokenWithLogo, USDC_GNOSIS_CHAIN, USDCe_GNOSIS_CHAIN } from '@cowprotocol/common-const'
import { getJotaiMergerStorage } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_FAVORITE_TOKENS } from '../../const/defaultFavoriteTokens'
import { TokensMap } from '../../types'
import { environmentAtom } from '../environmentAtom'

type FavoriteTokens = Record<SupportedChainId, TokensMap>

const EMPTY_FAVORITE_TOKENS: TokenWithLogo[] = []

export const favoriteTokensAtom = atomWithStorage<FavoriteTokens>(
  'favoriteTokensAtom:v2',
  DEFAULT_FAVORITE_TOKENS,
  getJotaiMergerStorage(),
)

export const favoriteTokensListAtom = atom((get) => {
  const { chainId } = get(environmentAtom)
  const favoriteTokensState = get(favoriteTokensAtom)
  const state = favoriteTokensState[chainId]

  if (!state) return EMPTY_FAVORITE_TOKENS

  return Object.values(state).map((token) => TokenWithLogo.fromToken(token, token.logoURI))
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

function migrateFavoriteTokensAtom(oldStorageKey: string, newStorageKey: string): void {
  try {
    const favoriteV1Raw = localStorage.getItem(oldStorageKey)

    if (!favoriteV1Raw) {
      return
    }

    const state = JSON.parse(favoriteV1Raw) as FavoriteTokens
    const USDC_address = USDC_GNOSIS_CHAIN.address.toLowerCase()

    // Replace USDC with USDC.e on Gnosis chain
    state[SupportedChainId.GNOSIS_CHAIN] = Object.keys(state[SupportedChainId.GNOSIS_CHAIN]).reduce<TokensMap>(
      (acc, address) => {
        if (address.toLowerCase() === USDC_address) {
          const { symbol = '', name = '' } = USDCe_GNOSIS_CHAIN
          acc[USDCe_GNOSIS_CHAIN.address] = { ...USDCe_GNOSIS_CHAIN, symbol, name }
        } else {
          acc[address] = state[SupportedChainId.GNOSIS_CHAIN][address]
        }
        return acc
      },
      {},
    )

    // Save the new state
    localStorage.setItem(newStorageKey, JSON.stringify(state))
  } catch (e) {
    console.error(`Failed to migrate storage from '${oldStorageKey}' to '${newStorageKey}'`, e)
  }

  localStorage.removeItem(oldStorageKey)
}

// TODO: Remove after 2024-09-15
// Migrate to the new USDC.e on gnosis chain AND update the localStorage key to the US spelling
migrateFavoriteTokensAtom('favouriteTokensAtom:v1', 'favoriteTokensAtom:v2')
