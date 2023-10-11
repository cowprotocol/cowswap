import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ListsSourcesByNetwork, ListState } from '../../types'
import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { environmentAtom } from '../environmentAtom'

type TokenListsState = Record<SupportedChainId, { [listId: string]: ListState }>

// Sources
const defaultListsSourcesAtom = atom<ListsSourcesByNetwork>(DEFAULT_TOKENS_LISTS)

export const userAddedListsSourcesAtom = atomWithStorage<ListsSourcesByNetwork>('userAddedTokenListsAtom:v1', {
  [SupportedChainId.MAINNET]: [],
  [SupportedChainId.GNOSIS_CHAIN]: [],
  [SupportedChainId.GOERLI]: [],
})

export const allListsSourcesAtom = atom((get) => {
  const { chainId } = get(environmentAtom)
  const defaultTokensLists = get(defaultListsSourcesAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)

  return [...defaultTokensLists[chainId], ...userAddedTokenLists[chainId]]
})

// Lists states
export const listsStatesByChainAtom = atomWithStorage<TokenListsState>('allTokenListsInfoAtom:v1', {
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

  return allTokensLists.reduce<{ [listId: string]: boolean }>((acc, tokenList) => {
    const state = listStates[tokenList.id]
    const isActive = state?.isEnabled

    acc[tokenList.id] = typeof isActive === 'boolean' ? isActive : !!tokenList.enabledByDefault

    return acc
  }, {})
})
