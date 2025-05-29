import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiMergerStorage } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_TOKENS_LISTS, LP_TOKEN_LISTS, UNISWAP_TOKENS_LIST } from '../../const/tokensLists'
import {
  ListSourceConfig,
  ListsSourcesByNetwork,
  ListState,
  TokenListsByChainState,
  TokenListsState,
} from '../../types'
import { environmentAtom } from '../environmentAtom'

const UNISWAP_TOKEN_LIST_URL: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: UNISWAP_TOKENS_LIST,
  [SupportedChainId.GNOSIS_CHAIN]:
    'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/Uniswap.100.json',
  [SupportedChainId.ARBITRUM_ONE]:
    'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/Uniswap.42161.json',
  [SupportedChainId.BASE]:
    'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/Uniswap.8453.json',
  [SupportedChainId.SEPOLIA]: UNISWAP_TOKENS_LIST,
  [SupportedChainId.POLYGON]:
    'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/Uniswap.137.json',
  [SupportedChainId.AVALANCHE]:
    'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/Uniswap.43114.json',
}

const curatedListSourceAtom = atom((get) => {
  const UNISWAP_LIST_SOURCE: ListSourceConfig = {
    priority: 1,
    enabledByDefault: true,
    source: UNISWAP_TOKEN_LIST_URL[get(environmentAtom).chainId],
  }

  return UNISWAP_LIST_SOURCE
})

export const userAddedListsSourcesAtom = atomWithStorage<ListsSourcesByNetwork>(
  'userAddedTokenListsAtom:v3',
  mapSupportedNetworks([]),
  getJotaiMergerStorage(),
)

export const allListsSourcesAtom = atom((get) => {
  const { chainId, useCuratedListOnly, isYieldEnabled } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)
  const userAddedTokenListsForChain = userAddedTokenLists[chainId] || []

  const lpLists = isYieldEnabled ? LP_TOKEN_LISTS : []

  if (useCuratedListOnly) {
    return [get(curatedListSourceAtom), ...lpLists, ...userAddedTokenListsForChain]
  }

  return [...(DEFAULT_TOKENS_LISTS[chainId] || []), ...lpLists, ...userAddedTokenListsForChain]
})

// Lists states
export const listsStatesByChainAtom = atomWithStorage<TokenListsByChainState>(
  'allTokenListsInfoAtom:v5',
  mapSupportedNetworks({}),
  getJotaiMergerStorage(),
)

export const tokenListsUpdatingAtom = atom<boolean>(false)

/**
 * Virtual lists are created programmatically
 * For example: widget integrators can just pass TokenInfo[] array, and it will be converted to virtual list
 * They are not stored in the local storage and always enabled
 * We also don't show them in the tokens list settings
 */
export const virtualListsStateAtom = atom<TokenListsState>({})

export const listsStatesMapAtom = atom((get) => {
  const { chainId, widgetAppCode, selectedLists, useCuratedListOnly } = get(environmentAtom)
  const allTokenListsInfo = get(listsStatesByChainAtom)
  const virtualListsState = get(virtualListsStateAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)
  const useeAddedTokenListsForChain = userAddedTokenLists[chainId] || []

  const currentNetworkLists = {
    ...allTokenListsInfo[chainId],
    ...virtualListsState,
  }

  const userAddedListSources = useeAddedTokenListsForChain.reduce<{ [key: string]: boolean }>((acc, list) => {
    acc[list.source] = true
    return acc
  }, {})

  const lpTokenListSources = LP_TOKEN_LISTS.reduce<{ [key: string]: boolean }>((acc, list) => {
    acc[list.source] = true
    return acc
  }, {})

  const listsSources = Object.keys(currentNetworkLists).filter((source) => {
    return useCuratedListOnly ? userAddedListSources[source] || lpTokenListSources[source] : true
  })

  const lists = useCuratedListOnly ? [get(curatedListSourceAtom).source, ...listsSources] : listsSources

  return lists.reduce<{ [source: string]: ListState }>((acc, source) => {
    const list = currentNetworkLists[source]

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

export const listsStatesListAtom = atom((get) => {
  return Object.values(get(listsStatesMapAtom))
})

export const listsEnabledStateAtom = atom((get) => {
  const allTokensLists = get(allListsSourcesAtom)
  const listStates = get(listsStatesMapAtom)
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
