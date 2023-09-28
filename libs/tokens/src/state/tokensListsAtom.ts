import { atom } from 'jotai'
import { TokenListsByNetwork } from '../types'
import { DEFAULT_TOKENS_LISTS } from '../const/tokensLists'
import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
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

export const activeTokensListsAtom = atom((get) => {
  const { chainId } = get(tokensListsEnvironmentAtom)
  const defaultTokensLists = get(defaultTokensListsAtom)
  const userAddedTokenLists = get(userAddedTokenListsAtom)
  const activeTokenLists = get(activeTokenListsIdsAtom)
  const currentActiveTokenLists = activeTokenLists[chainId]

  return [...defaultTokensLists[chainId], ...userAddedTokenLists[chainId]].filter((list) => {
    const isActive = currentActiveTokenLists[list.id]

    return isActive === undefined ? list.enabledByDefault : isActive
  })
})
