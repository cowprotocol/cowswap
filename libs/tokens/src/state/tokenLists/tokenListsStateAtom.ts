import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { mapSupportedNetworks } from '@cowprotocol/cow-sdk'

import { ListsSourcesByNetwork, ListState, TokenListsState } from '../../types'
import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { environmentAtom } from '../environmentAtom'

export const userAddedListsSourcesAtom = atomWithStorage<ListsSourcesByNetwork>(
  'userAddedTokenListsAtom:v2',
  mapSupportedNetworks([])
)

export const allListsSourcesAtom = atom((get) => {
  const { chainId } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)

  return [...DEFAULT_TOKENS_LISTS[chainId], ...(userAddedTokenLists[chainId] || [])]
})

// Lists states
export const listsStatesByChainAtom = atomWithStorage<TokenListsState>(
  'allTokenListsInfoAtom:v2',
  mapSupportedNetworks({})
)

export const tokenListsUpdatingAtom = atom<boolean>(false)

export const listsStatesMapAtom = atom((get) => {
  const { chainId, widgetAppCode, selectedLists } = get(environmentAtom)
  const allTokenListsInfo = get(listsStatesByChainAtom)
  const currentNetworkLists = allTokenListsInfo[chainId]

  return Object.keys(currentNetworkLists).reduce<{ [source: string]: ListState }>((acc, source) => {
    const list = currentNetworkLists[source]
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
