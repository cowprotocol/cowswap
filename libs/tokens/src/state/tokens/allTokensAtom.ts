import { atom } from 'jotai'

import { LpToken, NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import { TokenInfo } from '@cowprotocol/types'

import { favoriteTokensAtom } from './favoriteTokensAtom'
import { userAddedTokensAtom } from './userAddedTokensAtom'

import { LP_TOKEN_LIST_CATEGORIES, TokenListCategory, TokensMap } from '../../types'
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

type TokenCategoryByMap = Record<TokenListCategory, TokensMap>

type LpTokensByCategory = {
  [TokenListCategory.LP]: LpToken[]
  [TokenListCategory.COW_AMM_LP]: LpToken[]
}

interface TokensState {
  activeTokens: TokenCategoryByMap
  inactiveTokens: TokenCategoryByMap
}

const DEFAULT_TOKEN_CATEGORY_BY_MAP = {
  [TokenListCategory.ERC20]: {},
  [TokenListCategory.LP]: {},
  [TokenListCategory.COW_AMM_LP]: {},
}

const tokensStateAtom = atom<TokensState>((get) => {
  const { chainId } = get(environmentAtom)
  const listsStatesList = get(listsStatesListAtom)
  const listsEnabledState = get(listsEnabledStateAtom)

  return listsStatesList.reduce<TokensState>(
    (acc, list) => {
      const isListEnabled = listsEnabledState[list.source]

      list.list.tokens.forEach((token) => {
        const tokenInfo = parseTokenInfo(chainId, token)
        const tokenAddressKey = tokenInfo?.address.toLowerCase()

        if (!tokenInfo || !tokenAddressKey) return

        const category = list.category || TokenListCategory.ERC20

        if (isListEnabled) {
          if (!acc.activeTokens[category][tokenAddressKey]) {
            acc.activeTokens[category][tokenAddressKey] = tokenInfo
          }
        } else {
          if (!acc.inactiveTokens[category][tokenAddressKey]) {
            acc.inactiveTokens[category][tokenAddressKey] = tokenInfo
          }
        }
      })

      return acc
    },
    { activeTokens: { ...DEFAULT_TOKEN_CATEGORY_BY_MAP }, inactiveTokens: { ...DEFAULT_TOKEN_CATEGORY_BY_MAP } },
  )
})

const lpTokensMapAtom = atom((get) => {
  const { chainId } = get(environmentAtom)
  const listsStatesList = get(listsStatesListAtom)

  return listsStatesList.reduce<TokenCategoryByMap>(
    (acc, list) => {
      const category = !list.category || !LP_TOKEN_LIST_CATEGORIES.includes(list.category) ? undefined : list.category

      if (!category) {
        return acc
      }

      list.list.tokens.forEach((token) => {
        const tokenInfo = parseTokenInfo(chainId, token)
        const tokenAddressKey = tokenInfo?.address.toLowerCase()

        if (!tokenInfo || !tokenAddressKey) return

        acc[category][tokenAddressKey] = tokenInfo
      })

      return acc
    },
    { [TokenListCategory.COW_AMM_LP]: {}, [TokenListCategory.LP]: {} } as TokenCategoryByMap,
  )
})

export const lpTokensByCategoryAtom = atom<LpTokensByCategory>((get) => {
  const { chainId } = get(environmentAtom)
  const lpTokensMap = get(lpTokensMapAtom)
  const getTokensByCategory = (category: TokenListCategory) =>
    tokenMapToListWithLogo(lpTokensMap[category], category, chainId) as LpToken[]

  return {
    [TokenListCategory.LP]: getTokensByCategory(TokenListCategory.LP),
    [TokenListCategory.COW_AMM_LP]: getTokensByCategory(TokenListCategory.COW_AMM_LP),
  }
})

/**
 * Returns a list of tokens that are active and sorted alphabetically
 * The list includes: native token, user added tokens, favorite tokens and tokens from active lists
 * Native token is always the first element in the list
 */
export const activeTokensAtom = atom<TokenWithLogo[]>((get) => {
  const { chainId, enableLpTokensByDefault } = get(environmentAtom)
  const userAddedTokens = get(userAddedTokensAtom)
  const favoriteTokensState = get(favoriteTokensAtom)

  const tokensMap = get(tokensStateAtom)
  const lpTokensByCategory = get(lpTokensByCategoryAtom)
  const nativeToken = NATIVE_CURRENCIES[chainId]

  return [
    // Native, user added and favorite tokens
    ...tokenMapToListWithLogo(
      {
        [nativeToken.address.toLowerCase()]: nativeToken as TokenInfo,
        ...lowerCaseTokensMap(userAddedTokens[chainId]),
        ...lowerCaseTokensMap(favoriteTokensState[chainId]),
      },
      TokenListCategory.ERC20,
      chainId,
    ),
    // Tokens from active lists
    ...Object.keys(tokensMap.activeTokens).reduce<TokenWithLogo[]>((acc, _category) => {
      const category = _category as TokenListCategory
      const categoryMap = tokensMap.activeTokens[category]

      acc.push(...tokenMapToListWithLogo(categoryMap, category, chainId))
      return acc
    }, []),
    // LP tokens
    ...(enableLpTokensByDefault
      ? lpTokensByCategory[TokenListCategory.LP].concat(lpTokensByCategory[TokenListCategory.COW_AMM_LP])
      : []),
  ]
})

export const inactiveTokensAtom = atom<TokenWithLogo[]>((get) => {
  const { chainId } = get(environmentAtom)
  const tokensMap = get(tokensStateAtom)

  return Object.keys(tokensMap.inactiveTokens).reduce<TokenWithLogo[]>((acc, _category) => {
    const category = _category as TokenListCategory
    const categoryMap = tokensMap.inactiveTokens[category]

    acc.push(...tokenMapToListWithLogo(categoryMap, category, chainId))
    return acc
  }, [])
})

export const tokensByAddressAtom = atom<TokensByAddress>((get) => {
  return get(activeTokensAtom).reduce<TokensByAddress>((acc, token) => {
    acc[token.address.toLowerCase()] = token
    return acc
  }, {})
})

export const tokensBySymbolAtom = atom<TokensBySymbol>((get) => {
  return get(activeTokensAtom).reduce<TokensBySymbol>((acc, token) => {
    if (!token.symbol) return acc

    const symbol = token.symbol.toLowerCase()

    acc[symbol] = acc[symbol] || []

    acc[symbol].push(token)

    return acc
  }, {})
})
