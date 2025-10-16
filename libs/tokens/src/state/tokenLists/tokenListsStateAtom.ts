import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { atomWithIdbStorage, getJotaiMergerStorage } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import { UNISWAP_TOKEN_LIST_URL } from './uniswapTokenListUrls'

import { DEFAULT_TOKENS_LISTS, LP_TOKEN_LISTS } from '../../const/tokensLists'
import {
  ListSourceConfig,
  ListsSourcesByNetwork,
  ListState,
  TokenListsByChainState,
  TokenListsState,
} from '../../types'
import { environmentAtom } from '../environmentAtom'

export const curatedListSourceAtom = atom((get) => {
  const chainId = get(environmentAtom).chainId
  const UNISWAP_LIST_SOURCE: ListSourceConfig = {
    priority: 1,
    enabledByDefault: true,
    source: UNISWAP_TOKEN_LIST_URL[chainId],
  }

  return [UNISWAP_LIST_SOURCE]
})

export const userAddedListsSourcesAtom = atomWithStorage<ListsSourcesByNetwork>(
  'userAddedTokenListsAtom:v3',
  mapSupportedNetworks([]),
  getJotaiMergerStorage(),
)

export const removedListsSourcesAtom = atomWithStorage<Record<SupportedChainId, string[]>>(
  'removedTokenListsSourcesAtom:v1',
  mapSupportedNetworks<string[]>([]),
  getJotaiMergerStorage(),
)

export const allListsSourcesAtom = atom((get) => {
  const { chainId, useCuratedListOnly, isYieldEnabled } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)
  const removedListsSources = get(removedListsSourcesAtom)
  const userAddedTokenListsForChain = userAddedTokenLists[chainId] || []
  const removedListsForChain = removedListsSources[chainId] || []
  const removedSourcesSet = new Set(removedListsForChain.map((source) => source.toLowerCase()))

  const filterRemovedLists = (list: ListSourceConfig): boolean => {
    return !removedSourcesSet.has(list.source.toLowerCase())
  }

  const lpLists = (isYieldEnabled ? LP_TOKEN_LISTS : []).filter(filterRemovedLists)

  if (useCuratedListOnly) {
    const curatedLists = get(curatedListSourceAtom).filter(filterRemovedLists)

    return [...curatedLists, ...lpLists, ...userAddedTokenListsForChain]
  }

  const defaultLists = (DEFAULT_TOKENS_LISTS[chainId] || []).filter(filterRemovedLists)

  return [...defaultLists, ...lpLists, ...userAddedTokenListsForChain]
})

// Migrating from localStorage to indexedDB
localStorage.removeItem('allTokenListsInfoAtom:v5')

// Lists states
export const listsStatesByChainAtom = atomWithIdbStorage<TokenListsByChainState>(
  'allTokenListsInfoAtom:v6',
  mapSupportedNetworks({}),
)

export const tokenListsUpdatingAtom = atom<boolean>(false)

/**
 * Virtual lists are created programmatically
 * For example: widget integrators can just pass TokenInfo[] array, and it will be converted to virtual list
 * They are not stored in the local storage and always enabled
 * We also don't show them in the tokens list settings
 */
export const virtualListsStateAtom = atom<TokenListsState>({})

export const listsStatesMapAtom = atom(async (get) => {
  const { chainId, widgetAppCode, selectedLists, useCuratedListOnly } = get(environmentAtom)
  const allTokenListsInfo = await get(listsStatesByChainAtom)
  const virtualListsState = get(virtualListsStateAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)
  const removedListsSources = get(removedListsSourcesAtom)
  const useeAddedTokenListsForChain = userAddedTokenLists[chainId] || []
  const removedListsForChain = removedListsSources[chainId] || []
  const removedSourcesSet = new Set(removedListsForChain.map((source) => source.toLowerCase()))

  const currentNetworkLists = {
    ...(allTokenListsInfo[chainId] || {}),
    ...virtualListsState,
  } as TokenListsState

  const filteredNetworkLists = Object.entries(currentNetworkLists).reduce<TokenListsState>((acc, [source, list]) => {
    if (!removedSourcesSet.has(source.toLowerCase())) {
      acc[source] = list
    }

    return acc
  }, {})

  const userAddedListSources = useeAddedTokenListsForChain.reduce<{ [key: string]: boolean }>((acc, list) => {
    const sourceLower = list.source.toLowerCase()

    if (!removedSourcesSet.has(sourceLower)) {
      acc[list.source] = true
    }

    return acc
  }, {})

  const lpTokenListSources = LP_TOKEN_LISTS.reduce<{ [key: string]: boolean }>((acc, list) => {
    const sourceLower = list.source.toLowerCase()

    if (!removedSourcesSet.has(sourceLower)) {
      acc[list.source] = true
    }

    return acc
  }, {})

  const listsSources = Object.keys(filteredNetworkLists).filter((source) => {
    return useCuratedListOnly ? userAddedListSources[source] || lpTokenListSources[source] : true
  })

  const curatedListSources = get(curatedListSourceAtom)
    .map((val) => val.source)
    .filter((source) => !removedSourcesSet.has(source.toLowerCase()))

  const lists = useCuratedListOnly ? [...curatedListSources, ...listsSources] : listsSources

  return lists.reduce<{ [source: string]: ListState }>((acc, source) => {
    const list = filteredNetworkLists[source]

    if (!list) return acc

    const isDefaultList = !list.widgetAppCode
    const sourceLowerCased = source.toLowerCase()

    // In widget mode
    if (widgetAppCode) {
      // Add virtual lists without any checks
      if (virtualListsState[source]) {
        acc[source] = list
        return acc
      }

      // If only selected lists should be shown
      if (selectedLists?.length) {
        if (selectedLists.includes(sourceLowerCased)) {
          acc[source] = list
        }
      } else {
        // If default and widget lists should be shown
        if (isDefaultList || list.widgetAppCode === widgetAppCode) {
          acc[source] = list
        }
      }
      // Not in widget mode and list is default
    } else if (isDefaultList) {
      acc[source] = list
    }

    return acc
  }, {})
})

export const listsStatesListAtom = atom(async (get) => {
  return Object.values(await get(listsStatesMapAtom))
})

export const listsEnabledStateAtom = atom(async (get) => {
  const allTokensLists = get(allListsSourcesAtom)
  const listStates = await get(listsStatesMapAtom)
  const virtualListsState = get(virtualListsStateAtom)

  const state = allTokensLists.reduce<{ [source: string]: boolean }>((acc, tokenList) => {
    const state = listStates[tokenList.source]
    const isActive = state?.isEnabled

    acc[tokenList.source] = typeof isActive === 'boolean' ? isActive : !!tokenList.enabledByDefault

    return acc
  }, {})

  // Virtual lists are always enabled
  const virtualLists = Object.keys(virtualListsState).reduce<Record<string, boolean>>((acc, source) => {
    acc[source] = true
    return acc
  }, {})

  return { ...state, ...virtualLists }
})
