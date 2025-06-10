import { atom } from 'jotai'

import { NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenInfo } from '@cowprotocol/types'

import { favoriteTokensAtom } from './favoriteTokensAtom'
import { userAddedTokensAtom } from './userAddedTokensAtom'

import { ActiveTokensState, TokensBySymbolState, TokensMap } from '../../types'
import { lowerCaseTokensMap } from '../../utils/lowerCaseTokensMap'
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
      list.list.tokens.forEach((token) => {
        const tokenInfo = parseTokenInfo(chainId, token)
        const tokenAddressKey = tokenInfo?.address.toLowerCase()

        if (!tokenInfo || !tokenAddressKey) return

        if (lpTokenProvider) {
          tokenInfo.lpTokenProvider = lpTokenProvider
        }

        if (isListEnabled) {
          if (!acc.activeTokens[tokenAddressKey]) {
            acc.activeTokens[tokenAddressKey] = tokenInfo
          }
        } else {
          if (!acc.inactiveTokens[tokenAddressKey]) {
            acc.inactiveTokens[tokenAddressKey] = tokenInfo
          }
        }
      })

      return acc
    },
    { activeTokens: {}, inactiveTokens: {} },
  )
})

export const activeTokensMapAtom = atom<TokensMap>((get) => {
  return get(tokensStateAtom).activeTokens
})

/**
 * Returns a list of tokens that are active and sorted alphabetically
 * The list includes: native token, user added tokens, favorite tokens and tokens from active lists
 * Native token is always the first element in the list
 */
export const allActiveTokensAtom = atom<ActiveTokensState>((get) => {
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

  /**
   * Order is important!
   * The end of the array has the highest priority.
   * It means that activeTokens should take precedence over favoriteTokens
   */
  const tokens = tokenMapToListWithLogo(
    (lpTokens ? [lpTokens] : [])
      .concat([
        lowerCaseTokensMap(favoriteTokensState[chainId]),
        lowerCaseTokensMap(userAddedTokens[chainId] || {}),
        tokensMap.activeTokens,
      ])
      .concat(nativeToken ? [{ [nativeToken.address.toLowerCase()]: nativeToken as TokenInfo }] : []),
    chainId,
  )

  return { tokens, chainId }
})

export const inactiveTokensAtom = atom<TokenWithLogo[]>((get) => {
  const { chainId } = get(environmentAtom)
  const tokensMap = get(tokensStateAtom)

  return tokenMapToListWithLogo([tokensMap.inactiveTokens], chainId)
})

export const tokensByAddressAtom = atom<{ tokens: TokensByAddress; chainId: SupportedChainId }>((get) => {
  const activeTokens = get(allActiveTokensAtom)

  const tokens = activeTokens.tokens.reduce<TokensByAddress>((acc, token) => {
    acc[token.address.toLowerCase()] = token
    return acc
  }, {})

  return {
    tokens,
    chainId: activeTokens.chainId,
  }
})

export const tokensBySymbolAtom = atom<TokensBySymbolState>((get) => {
  const { tokens, chainId } = get(allActiveTokensAtom)
  const tokensBySymbol = tokens.reduce<TokensBySymbol>((acc, token) => {
    if (!token.symbol) return acc

    const symbol = token.symbol.toLowerCase()

    acc[symbol] = acc[symbol] || []

    acc[symbol].push(token)

    return acc
  }, {})

  return { tokens: tokensBySymbol, chainId }
})
