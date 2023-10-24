import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ListsSourcesByNetwork, TokenListsState } from '../../types'
import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { environmentAtom } from '../environmentAtom'

export const userAddedListsSourcesAtom = atomWithStorage<ListsSourcesByNetwork>('userAddedTokenListsAtom:v2', {
  [SupportedChainId.MAINNET]: [],
  [SupportedChainId.GNOSIS_CHAIN]: [],
  [SupportedChainId.GOERLI]: [],
})

export const allListsSourcesAtom = atom((get) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)

  return [...DEFAULT_TOKENS_LISTS[chainId], ...userAddedTokenLists[chainId]]
})

// Lists states
export const listsStatesByChainAtom = atomWithStorage<TokenListsState>('allTokenListsInfoAtom:v2', {
  [SupportedChainId.MAINNET]: {},
  [SupportedChainId.GNOSIS_CHAIN]: {},
  [SupportedChainId.GOERLI]: {},
})

export const tokenListsUpdatingAtom = atom<boolean>(false)

export const listsStatesMapAtom = atom((get) => {
  const { chainId } = get(environmentAtom)
  const allTokenListsInfo = get(listsStatesByChainAtom)

  return { ...allTokenListsInfo[chainId] }
})

export const listsStatesListAtom = atom((get) => {
  return Object.values(get(listsStatesMapAtom))
})

export const listsEnabledStateAtom = atom((get) => {
  const allTokensLists = get(allListsSourcesAtom)
  const listStates = get(listsStatesMapAtom)

  return allTokensLists.reduce<{ [source: string]: boolean }>((acc, tokenList) => {
    const state = listStates[tokenList.source]
    const isActive = state?.isEnabled

    acc[tokenList.source] = typeof isActive === 'boolean' ? isActive : !!tokenList.enabledByDefault

    return acc
  }, {})
})
