import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokensMap, TokenWithLogo } from '../types'
import { tokensListsEnvironmentAtom } from './tokensListsEnvironmentAtom'

export const userAddedTokensAtom = atomWithStorage<Record<SupportedChainId, TokensMap>>('userAddedTokensAtom:v1', {
  [SupportedChainId.MAINNET]: {},
  [SupportedChainId.GNOSIS_CHAIN]: {},
  [SupportedChainId.GOERLI]: {},
})

export const userAddedTokensListAtom = atom((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const userAddedTokensState = get(userAddedTokensAtom)

  return Object.values(userAddedTokensState[chainId]).map(
    (token) => new TokenWithLogo(token.logoURI, token.chainId, token.address, token.decimals, token.symbol, token.name)
  )
})
