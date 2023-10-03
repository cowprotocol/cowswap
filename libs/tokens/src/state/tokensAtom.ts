import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'
import { tokensListsEnvironmentAtom } from './tokensListsEnvironmentAtom'
import { TokensMap, TokenWithLogo } from '../types'

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

export const tokensAtom = atom((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)

  return tokensAtomsByChainId[chainId]
})

export const activeTokensAtom = atom<TokenWithLogo[]>((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const tokensMap = get(tokensAtomsByChainId[chainId])

  return Object.values(tokensMap.activeTokens)
    .sort((a, b) => (a.symbol > b.symbol ? 1 : -1))
    .map(
      (token) =>
        new TokenWithLogo(token.logoURI, token.chainId, token.address, token.decimals, token.symbol, token.name)
    )
})

export const setTokensAtom = atom(null, (get, set, state: TokensState) => {
  const { chainId } = get(tokensListsEnvironmentAtom)

  set(tokensAtomsByChainId[chainId], state)
})
