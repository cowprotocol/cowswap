import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'
import { tokensListsEnvironmentAtom } from './tokensListsEnvironmentAtom'
import { TokensMap } from '../types'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { tokenMapToList } from '../utils/tokenMapToList'
import { userAddedTokensAtom } from './userAddedTokensAtom'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

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
  const { chainId } = get(tokensListsEnvironmentAtom)
  const userAddedTokens = get(userAddedTokensAtom)
  const tokensMap = get(tokensAtomsByChainId)[chainId]

  return tokenMapToList({ ...tokensMap.activeTokens, ...userAddedTokens[chainId] })
})

export const inactiveTokensAtom = atom<TokenWithLogo[]>((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const tokensMap = get(tokensAtomsByChainId)[chainId]

  return tokenMapToList(tokensMap.inactiveTokens)
})

export const setTokensAtom = atom(null, (get, set, state: TokensState) => {
  const { chainId } = get(tokensListsEnvironmentAtom)

  set(updateTokensAtom, { [chainId]: state })
})
