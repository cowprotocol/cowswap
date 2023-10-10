import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'
import { environmentAtom } from '../environmentAtom'
import { TokensMap } from '../../types'
import { NATIVE_CURRENCY_BUY_TOKEN, TokenWithLogo } from '@cowprotocol/common-const'
import { tokenMapToList } from '../../utils/tokenMapToList'
import { userAddedTokensAtom } from './userAddedTokensAtom'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { favouriteTokensAtom } from './favouriteTokensAtom'

export type TokensByAddress = { [address: string]: TokenWithLogo }

export type TokensBySymbol = { [address: string]: TokenWithLogo[] }

export type TokensState = { activeTokens: TokensMap; inactiveTokens: TokensMap }

const defaultState: TokensState = { activeTokens: {}, inactiveTokens: {} }

const { atom: tokensAtomsByChainId, updateAtom: updateTokensAtom } = atomWithPartialUpdate(
  atomWithStorage<Record<SupportedChainId, TokensState>>('tokensAtomsByChainId:v1', {
    [SupportedChainId.MAINNET]: { ...defaultState },
    [SupportedChainId.GNOSIS_CHAIN]: { ...defaultState },
    [SupportedChainId.GOERLI]: { ...defaultState },
  })
)

export const activeTokensAtom = atom<TokenWithLogo[]>((get) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokens = get(userAddedTokensAtom)
  const favouriteTokensState = get(favouriteTokensAtom)

  const tokensMap = get(tokensAtomsByChainId)[chainId]
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
  const { chainId } = get(environmentAtom)
  const tokensMap = get(tokensAtomsByChainId)[chainId]

  return tokenMapToList(tokensMap.inactiveTokens)
})

export const setTokensAtom = atom(null, (get, set, chainId: SupportedChainId, state: TokensState) => {
  set(updateTokensAtom, { [chainId]: state })
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
