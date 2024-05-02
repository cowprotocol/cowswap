import { atom } from 'jotai'

import { NATIVE_CURRENCIES, TokenWithLogo } from '@cowprotocol/common-const'
import { TokenInfo } from '@cowprotocol/types'

import { favouriteTokensAtom } from './favouriteTokensAtom'
import { userAddedTokensAtom } from './userAddedTokensAtom'

import { TokensMap } from '../../types'
import { lowerCaseTokensMap } from '../../utils/lowerCaseTokensMap'
import { tokenMapToListWithLogo } from '../../utils/tokenMapToListWithLogo'
import { environmentAtom } from '../environmentAtom'
import { listsEnabledStateAtom, listsStatesListAtom } from '../tokenLists/tokenListsStateAtom'


export interface TokensByAddress {
  [address: string]: TokenWithLogo | undefined
}

export interface TokensBySymbol {
  [address: string]: TokenWithLogo[]
}

export interface TokensState {
  activeTokens: TokensMap
  inactiveTokens: TokensMap
}

interface BridgeInfo {
  [chainId: number]: {
    tokenAddress: string
  }
}

export const tokensStateAtom = atom<TokensState>((get) => {
  const { chainId } = get(environmentAtom)
  const listsStatesList = get(listsStatesListAtom)
  const listsEnabledState = get(listsEnabledStateAtom)

  return listsStatesList.reduce<TokensState>(
    (acc, list) => {
      const isListEnabled = listsEnabledState[list.source]

      list.list.tokens.forEach((token) => {
        const bridgeInfo = token.extensions?.['bridgeInfo'] as never as BridgeInfo | undefined
        const currentChainInfo = bridgeInfo?.[chainId]
        const bridgeAddress = currentChainInfo?.tokenAddress

        if (token.chainId !== chainId && !bridgeAddress) return

        const tokenAddress = bridgeAddress || token.address
        const tokenAddressKey = tokenAddress.toLowerCase()
        const tokenInfo: TokenInfo = {
          ...token,
          address: tokenAddress,
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
    { activeTokens: {}, inactiveTokens: {} }
  )
})

/**
 * Returns a list of tokens that are active and sorted alphabetically
 * The list includes: native token, user added tokens, favourite tokens and tokens from active lists
 * Native token is always the first element in the list
 */
export const activeTokensAtom = atom<TokenWithLogo[]>((get) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokens = get(userAddedTokensAtom)
  const favouriteTokensState = get(favouriteTokensAtom)

  const tokensMap = get(tokensStateAtom)
  const nativeToken = NATIVE_CURRENCIES[chainId]

  return tokenMapToListWithLogo(
    {
      [nativeToken.address.toLowerCase()]: nativeToken as TokenInfo,
      ...tokensMap.activeTokens,
      ...lowerCaseTokensMap(userAddedTokens[chainId]),
      ...lowerCaseTokensMap(favouriteTokensState[chainId]),
    },
    chainId
  )
})

export const inactiveTokensAtom = atom<TokenWithLogo[]>((get) => {
  const { chainId } = get(environmentAtom)
  const tokensMap = get(tokensStateAtom)

  return tokenMapToListWithLogo(tokensMap.inactiveTokens, chainId)
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
