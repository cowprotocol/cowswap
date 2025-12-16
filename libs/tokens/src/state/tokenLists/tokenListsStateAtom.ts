import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { COW_CDN } from '@cowprotocol/common-const'
import { atomWithIdbStorage, getJotaiMergerStorage } from '@cowprotocol/core'
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

const TOKEN_LIST_SRC = `${COW_CDN}/token-lists`

const UNISWAP_TOKEN_LIST_URL: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: UNISWAP_TOKENS_LIST,
  [SupportedChainId.GNOSIS_CHAIN]: `${TOKEN_LIST_SRC}/Uniswap.100.json`,
  [SupportedChainId.ARBITRUM_ONE]: `${TOKEN_LIST_SRC}/Uniswap.42161.json`,
  [SupportedChainId.BASE]: `${TOKEN_LIST_SRC}/Uniswap.8453.json`,
  [SupportedChainId.SEPOLIA]: UNISWAP_TOKENS_LIST,
  [SupportedChainId.POLYGON]: `${TOKEN_LIST_SRC}/Uniswap.137.json`,
  [SupportedChainId.AVALANCHE]: `${TOKEN_LIST_SRC}/Uniswap.43114.json`,
  [SupportedChainId.LENS]: `${TOKEN_LIST_SRC}/CoinGecko.232.json`, // There's no Uniswap list for Lens, using Coingecko as a fallback
  [SupportedChainId.BNB]: `${TOKEN_LIST_SRC}/Uniswap.56.json`,
  [SupportedChainId.LINEA]: `${TOKEN_LIST_SRC}/Uniswap.59144.json`, // TODO: create lists if possible
  [SupportedChainId.PLASMA]: `${TOKEN_LIST_SRC}/Uniswap.9745.json`, // TODO: create lists if possible
}

const curatedListSourceAtom = atom((get) => {
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

export const allListsSourcesAtom = atom((get) => {
  const { chainId, useCuratedListOnly, isYieldEnabled } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)
  const userAddedTokenListsForChain = userAddedTokenLists[chainId] || []

  const lpLists = isYieldEnabled ? LP_TOKEN_LISTS : []

  if (useCuratedListOnly) {
    return [...get(curatedListSourceAtom), ...lpLists, ...userAddedTokenListsForChain]
  }

  return [...(DEFAULT_TOKENS_LISTS[chainId] || []), ...lpLists, ...userAddedTokenListsForChain]
})

// Migrating from localStorage to indexedDB
localStorage.removeItem('allTokenListsInfoAtom:v5')

// Lists states
// Note: v6 -> v7 migration is handled by migrateTokenListsFromGithubToCdn()
export const listsStatesByChainAtom = atomWithIdbStorage<TokenListsByChainState>(
  'allTokenListsInfoAtom:v7',
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
  const virtualListsState = get(virtualListsStateAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)
  const useeAddedTokenListsForChain = userAddedTokenLists[chainId] || []

  const allTokenListsInfo = await get(listsStatesByChainAtom)
  const listsState = allTokenListsInfo[chainId] || {}

  const currentNetworkLists = {
    ...Object.keys(listsState).reduce<TokenListsState>((acc, key) => {
      const val = listsState[key]

      if (val !== 'deleted') {
        acc[key] = val
      }

      return acc
    }, {}),
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

  const lists = useCuratedListOnly
    ? [...get(curatedListSourceAtom).map((val) => val.source), ...listsSources]
    : listsSources

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
