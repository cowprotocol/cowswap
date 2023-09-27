import { atom } from 'jotai'
import { TokenListsByNetwork } from '../types'
import { DEFAULT_ACTIVE_TOKENS_LISTS, DEFAULT_TOKENS_LISTS } from '../const/tokensLists'
import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export const tokensListsEnvironmentAtom = atom<{ chainId: SupportedChainId }>({
  chainId: SupportedChainId.MAINNET,
})

export const defaultTokensListsAtom = atom<TokenListsByNetwork>(DEFAULT_TOKENS_LISTS)

export const userAddedTokenListsAtom = atomWithStorage<TokenListsByNetwork>('userAddedTokenListsAtom:v1', {
  [SupportedChainId.MAINNET]: [],
  [SupportedChainId.GNOSIS_CHAIN]: [],
  [SupportedChainId.GOERLI]: [],
})

export const activeTokenListsAtom = atomWithStorage('activeTokenListsAtom:v1', DEFAULT_ACTIVE_TOKENS_LISTS)

export const tokensListsAtom = atom((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const defaultTokensLists = get(defaultTokensListsAtom)
  const userAddedTokenLists = get(userAddedTokenListsAtom)
  const activeTokenLists = get(activeTokenListsAtom)
  const currentActiveTokenLists = activeTokenLists[chainId]

  return [...defaultTokensLists[chainId], ...userAddedTokenLists[chainId]].filter((list) =>
    currentActiveTokenLists.includes(list.url)
  )
})
