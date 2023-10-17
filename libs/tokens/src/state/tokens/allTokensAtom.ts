import { atom } from 'jotai'
import { environmentAtom } from '../environmentAtom'
import { TokensMap } from '../../types'
import { NATIVE_CURRENCY_BUY_TOKEN, TokenWithLogo } from '@cowprotocol/common-const'
import { tokenMapToList } from '../../utils/tokenMapToList'
import { userAddedTokensAtom } from './userAddedTokensAtom'
import { favouriteTokensAtom } from './favouriteTokensAtom'
import { listsEnabledStateAtom, listsStatesListAtom } from '../tokenLists/tokenListsStateAtom'

export interface TokensByAddress {
  [address: string]: TokenWithLogo
}

export interface TokensBySymbol {
  [address: string]: TokenWithLogo[]
}

export interface TokensState {
  activeTokens: TokensMap
  inactiveTokens: TokensMap
}

export const tokensStateAtom = atom<TokensState>((get) => {
  const { chainId } = get(environmentAtom)
  const listsStatesList = get(listsStatesListAtom)
  const listsEnabledState = get(listsEnabledStateAtom)

  return listsStatesList.reduce<TokensState>(
    (acc, list) => {
      const isListEnabled = listsEnabledState[list.id]

      list.list.tokens.forEach((token) => {
        if (token.chainId !== chainId) return

        const tokenAddress = token.address.toLowerCase()

        if (isListEnabled) {
          acc.activeTokens[tokenAddress] = token
        } else {
          acc.inactiveTokens[tokenAddress] = token
        }
      })

      return acc
    },
    { activeTokens: {}, inactiveTokens: {} }
  )
})

export const activeTokensAtom = atom<TokenWithLogo[]>((get) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokens = get(userAddedTokensAtom)
  const favouriteTokensState = get(favouriteTokensAtom)

  const tokensMap = get(tokensStateAtom)
  const nativeToken = NATIVE_CURRENCY_BUY_TOKEN[chainId]

  const tokens = tokenMapToList({
    ...tokensMap.activeTokens,
    ...userAddedTokens[chainId],
    ...favouriteTokensState[chainId],
  })

  tokens.unshift(nativeToken)

  return tokens
})

export const inactiveTokensAtom = atom<TokenWithLogo[]>((get) => {
  const tokensMap = get(tokensStateAtom)

  return tokenMapToList(tokensMap.inactiveTokens)
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
