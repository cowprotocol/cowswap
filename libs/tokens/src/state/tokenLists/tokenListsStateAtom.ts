import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'

import { ListSourceConfig, ListsSourcesByNetwork, ListState, TokenListsState } from '../../types'
import { DEFAULT_TOKENS_LISTS, UNISWAP_TOKENS_LIST } from '../../const/tokensLists'
import { environmentAtom } from '../environmentAtom'
import { getJotaiMergerStorage } from '@cowprotocol/core'

const UNISWAP_LIST_SOURCE: ListSourceConfig = {
  priority: 1,
  enabledByDefault: true,
  source: UNISWAP_TOKENS_LIST,
}

export const userAddedListsSourcesAtom = atomWithStorage<ListsSourcesByNetwork>(
  'userAddedTokenListsAtom:v3',
  mapSupportedNetworks([]),
  getJotaiMergerStorage()
)

export const allListsSourcesAtom = atom((get) => {
  const { chainId, useCuratedListOnly } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)

  if (useCuratedListOnly) {
    return [UNISWAP_LIST_SOURCE, ...userAddedTokenLists[chainId]]
  }

  return [...DEFAULT_TOKENS_LISTS[chainId], ...(userAddedTokenLists[chainId] || [])]
})

// Lists states
export const listsStatesByChainAtom = atomWithStorage<TokenListsState>(
  'allTokenListsInfoAtom:v3',
  mapSupportedNetworks({}),
  getJotaiMergerStorage()
)

export const tokenListsUpdatingAtom = atom<boolean>(false)

export const listsStatesMapAtom = atom((get) => {
  const { chainId, widgetAppCode, selectedLists, useCuratedListOnly } = get(environmentAtom)
  const allTokenListsInfo = get(listsStatesByChainAtom)
  const currentNetworkLists = allTokenListsInfo[chainId] || {}
  const userAddedTokenLists = get(userAddedListsSourcesAtom)
  const userAddedListSources = userAddedTokenLists[chainId].reduce<{ [key: string]: boolean }>((acc, list) => {
    acc[list.source] = true
    return acc
  }, {})

  const listsSources = Object.keys(currentNetworkLists).filter((source) => {
    return useCuratedListOnly ? userAddedListSources[source] : true
  })
  const lists = useCuratedListOnly ? [UNISWAP_TOKENS_LIST, ...listsSources] : listsSources

  return lists.reduce<{ [source: string]: ListState }>((acc, source) => {
    const list = currentNetworkLists[source]

    if (!list) return acc

    const isDefaultList = !list.widgetAppCode
    const sourceLowerCased = source.toLowerCase()

    // In widget mode
    if (widgetAppCode) {
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
