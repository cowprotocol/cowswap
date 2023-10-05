import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'
import { tokensListsEnvironmentAtom } from './tokensListsEnvironmentAtom'
import { TokensMap } from '../types'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { tokenMapToList } from '../utils/tokenMapToList'
import { userAddedTokensAtom } from './userAddedTokensAtom'

export type TokensState = { activeTokens: TokensMap; inactiveTokens: TokensMap }

const defaultState: TokensState = { activeTokens: {}, inactiveTokens: {} }

export const tokensMainnetAtom = atomWithStorage<TokensState>('tokensMainnetAtom:v1', { ...defaultState })
export const tokensGnosisChainAtom = atomWithStorage<TokensState>('tokensGnosisChainAtom:v1', { ...defaultState })
export const tokensGoerliAtom = atomWithStorage<TokensState>('tokensGoerliAtom:v1', { ...defaultState })

const tokensAtomsByChainId: Record<SupportedChainId, typeof tokensMainnetAtom> = {
  [SupportedChainId.MAINNET]: tokensMainnetAtom,
  [SupportedChainId.GNOSIS_CHAIN]: tokensGnosisChainAtom,
  [SupportedChainId.GOERLI]: tokensGoerliAtom,
}

export const activeTokensAtom = atom<TokenWithLogo[]>((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const userAddedTokens = get(userAddedTokensAtom)
  const tokensMap = get(tokensAtomsByChainId[chainId])

  return tokenMapToList({ ...tokensMap.activeTokens, ...userAddedTokens[chainId] })
})

export const inactiveTokensAtom = atom<TokenWithLogo[]>((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const tokensMap = get(tokensAtomsByChainId[chainId])

  return tokenMapToList(tokensMap.inactiveTokens)
})

export const setTokensAtom = atom(null, (get, set, state: TokensState) => {
  const { chainId } = get(tokensListsEnvironmentAtom)

  set(tokensAtomsByChainId[chainId], state)
})
