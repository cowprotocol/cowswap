import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TokenInfo } from '@uniswap/token-lists'
import { atom } from 'jotai'
import { tokensListsEnvironmentAtom } from './tokensListsEnvironmentAtom'

export type TokensMap = { [tokenAddress: string]: TokenInfo }

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

export const setTokensAtom = atom(null, (get, set, state: TokensState) => {
  const { chainId } = get(tokensListsEnvironmentAtom)

  set(tokensAtomsByChainId[chainId], state)
})
