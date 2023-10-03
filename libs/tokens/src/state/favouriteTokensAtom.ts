import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokensMap, TokenWithLogo } from '../types'
import { tokensListsEnvironmentAtom } from './tokensListsEnvironmentAtom'

export const favouriteTokensAtom = atomWithStorage<Record<SupportedChainId, TokensMap>>('favouriteTokensAtom:v1', {
  [SupportedChainId.MAINNET]: {},
  [SupportedChainId.GNOSIS_CHAIN]: {},
  [SupportedChainId.GOERLI]: {},
})

export const favouriteTokensListAtom = atom((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const favouriteTokensState = get(favouriteTokensAtom)

  return Object.values(favouriteTokensState[chainId]).map(
    (token) => new TokenWithLogo(token.logoURI, token.chainId, token.address, token.decimals, token.symbol, token.name)
  )
})
