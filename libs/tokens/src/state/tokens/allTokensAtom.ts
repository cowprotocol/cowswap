import { atom } from 'jotai'

import { NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import { TokenInfo } from '@cowprotocol/types'

import { favoriteTokensAtom } from './favoriteTokensAtom'
import { userAddedTokensAtom } from './userAddedTokensAtom'

import { ActiveTokensState, TokensBySymbolState, TokensMap } from '../../types'
import { lowerCaseTokensMap } from '../../utils/lowerCaseTokensMap'
import { mergeTokenMaps } from '../../utils/mergeTokenMaps'
import { parseTokenInfo } from '../../utils/parseTokenInfo'
import { tokenMapToListWithLogo } from '../../utils/tokenMapToListWithLogo'
import { environmentAtom } from '../environmentAtom'
import { listsEnabledStateAtom, listsStatesListAtom } from '../tokenLists/tokenListsStateAtom'

export interface TokensByAddress {
  [address: string]: TokenWithLogo | undefined
}

export interface TokensBySymbol {
  [address: string]: TokenWithLogo[]
}

interface TokensState {
  activeTokens: TokensMap
  inactiveTokens: TokensMap
}

const tokensStateAtom = atom<TokensState>((get) => {
  const { chainId } = get(environmentAtom)
  const listsStatesList = get(listsStatesListAtom)
  const listsEnabledState = get(listsEnabledStateAtom)

  return listsStatesList.reduce<TokensState>(
    (acc, list) => {
      const isListEnabled = listsEnabledState[list.source]
      const lpTokenProvider = list.lpTokenProvider
      const currentListTokens: TokensMap = {}

      list.list.tokens.forEach((token) => {
        const tokenInfo = parseTokenInfo(chainId, token)
        const tokenAddressKey = tokenInfo?.address.toLowerCase()

        if (!tokenInfo || !tokenAddressKey || tokenInfo.chainId !== chainId) {
          return
        }

        if (lpTokenProvider) {
          tokenInfo.lpTokenProvider = lpTokenProvider
        }

        currentListTokens[tokenAddressKey] = tokenInfo
      })

      if (isListEnabled) {
        acc.activeTokens = mergeTokenMaps(acc.activeTokens, currentListTokens)
      } else {
        acc.inactiveTokens = mergeTokenMaps(acc.inactiveTokens, currentListTokens)
      }

      return acc
    },
    { activeTokens: {}, inactiveTokens: {} },
  )
})

/**
 * Returns a list of tokens that are active and sorted alphabetically
 * The list includes: native token, user added tokens, favorite tokens and tokens from active lists
 * Native token is always the first element in the list
 */
export const activeTokensAtom = atom<ActiveTokensState>((get) => {
  const { chainId, enableLpTokensByDefault } = get(environmentAtom)
  const userAddedTokens = get(userAddedTokensAtom)
  const favoriteTokensState = get(favoriteTokensAtom)
  const tokensMap = get(tokensStateAtom)
  const nativeToken = NATIVE_CURRENCIES[chainId]

  const lpTokens = enableLpTokensByDefault
    ? Object.keys(tokensMap.inactiveTokens).reduce<TokensMap>((acc, key) => {
        const token = tokensMap.inactiveTokens[key]
        if (token.lpTokenProvider) {
          acc[key] = token
        }
        return acc
      }, {})
    : null

  const mergedTokens = mergeTokenMaps(
    { [nativeToken.address.toLowerCase()]: nativeToken as TokenInfo },
    lpTokens,
    lowerCaseTokensMap(favoriteTokensState[chainId]),
    tokensMap.activeTokens,
    lowerCaseTokensMap(userAddedTokens[chainId] || {}),
  )

  const tokens = tokenMapToListWithLogo(mergedTokens, chainId)

  return { tokens, chainId }
})

export const inactiveTokensAtom = atom<TokenWithLogo[]>((get) => {
  const { chainId } = get(environmentAtom)
  const tokensMap = get(tokensStateAtom)

  return tokenMapToListWithLogo(tokensMap.inactiveTokens, chainId)
})

export const tokensByAddressAtom = atom<TokensByAddress>((get) => {
  return get(activeTokensAtom).tokens.reduce<TokensByAddress>((acc, token) => {
    acc[token.address.toLowerCase()] = token
    return acc
  }, {})
})

export const tokensBySymbolAtom = atom<TokensBySymbolState>((get) => {
  const { tokens, chainId } = get(activeTokensAtom)
  const tokensBySymbol = tokens.reduce<TokensBySymbol>((acc, token) => {
    if (!token.symbol) return acc

    const symbol = token.symbol.toLowerCase()

    acc[symbol] = acc[symbol] || []

    acc[symbol].push(token)

    return acc
  }, {})

  return { tokens: tokensBySymbol, chainId }
})
