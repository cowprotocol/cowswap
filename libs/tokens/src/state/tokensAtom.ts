import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TokenInfo } from '@uniswap/token-lists'
import { atom } from 'jotai'
import { tokensListsEnvironmentAtom } from './tokensListsEnvironmentAtom'

export type TokensMap = { [tokenAddress: string]: TokenInfo }

export const tokensMainnetAtom = atomWithStorage<TokensMap>('tokensMainnetAtom:v1', {})
export const tokensGnosisChainAtom = atomWithStorage<TokensMap>('tokensGnosisChainAtom:v1', {})
export const tokensGoerliAtom = atomWithStorage<TokensMap>('tokensGoerliAtom:v1', {})

const tokensAtomsByChainId: Record<SupportedChainId, typeof tokensMainnetAtom> = {
  [SupportedChainId.MAINNET]: tokensMainnetAtom,
  [SupportedChainId.GNOSIS_CHAIN]: tokensGnosisChainAtom,
  [SupportedChainId.GOERLI]: tokensGoerliAtom,
}

export const tokensAtom = atom((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)

  return tokensAtomsByChainId[chainId]
})

export const setTokensAtom = atom(null, (get, set, state: TokensMap) => {
  const { chainId } = get(tokensListsEnvironmentAtom)

  set(tokensAtomsByChainId[chainId], state)
})
