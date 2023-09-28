import { atom } from 'jotai'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenListsByNetwork } from '../types'
import { DEFAULT_TOKENS_LISTS } from '../const/tokensLists'
import { atomWithStorage } from 'jotai/utils'
import { tokensListsEnvironmentAtom } from './tokensListsEnvironmentAtom'

export const defaultTokensListsAtom = atom<TokenListsByNetwork>(DEFAULT_TOKENS_LISTS)

export const userAddedTokenListsAtom = atomWithStorage<TokenListsByNetwork>('userAddedTokenListsAtom:v1', {
  [SupportedChainId.MAINNET]: [],
  [SupportedChainId.GNOSIS_CHAIN]: [],
  [SupportedChainId.GOERLI]: [],
})

export const activeTokenListsIdsAtom = atomWithStorage<Record<SupportedChainId, { [id: string]: boolean }>>(
  'activeTokenListsAtom:v1',
  {
    [SupportedChainId.MAINNET]: {},
    [SupportedChainId.GNOSIS_CHAIN]: {},
    [SupportedChainId.GOERLI]: {},
  }
)

export const allTokensListsAtom = atom((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const defaultTokensLists = get(defaultTokensListsAtom)
  const userAddedTokenLists = get(userAddedTokenListsAtom)

  return [...defaultTokensLists[chainId], ...userAddedTokenLists[chainId]]
})

export const activeTokensListsAtom = atom((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const allTokensLists = get(allTokensListsAtom)
  const activeTokenLists = get(activeTokenListsIdsAtom)
  const currentActiveTokenLists = activeTokenLists[chainId]

  return allTokensLists.filter((list) => {
    const isActive = currentActiveTokenLists[list.id]

    return isActive === undefined ? list.enabledByDefault : isActive
  })
})
