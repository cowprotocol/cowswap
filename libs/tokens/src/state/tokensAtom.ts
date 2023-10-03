import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { atom } from 'jotai'
import { tokensListsEnvironmentAtom } from './tokensListsEnvironmentAtom'
import { TokensMap, TokenWithLogo } from '../types'

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

export const tokensListAtom = atom<TokenWithLogo[]>((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const tokensMap = get(tokensAtomsByChainId[chainId])

  return Object.values(tokensMap)
    .sort((a, b) => (a.symbol > b.symbol ? 1 : -1))
    .map(
      (token) =>
        new TokenWithLogo(token.logoURI, token.chainId, token.address, token.decimals, token.symbol, token.name)
    )
})

export const setTokensAtom = atom(null, (get, set, state: TokensMap) => {
  const { chainId } = get(tokensListsEnvironmentAtom)

  set(tokensAtomsByChainId[chainId], state)
})
