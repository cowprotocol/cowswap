import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { atomWithIdbStorage, getJotaiMergerStorage } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_TOKENS_LISTS, LP_TOKEN_LISTS } from '../../const/tokensLists'
import { getSourceAsKey } from '../../hooks/lists/useIsListBlocked'
import { ListsSourcesByNetwork, ListState, TokenListsByChainState, TokenListsState } from '../../types'
import { environmentAtom } from '../environmentAtom'
import { tokenListsMigrated } from '../migrations/tokenListsMigrations'

export const userAddedListsSourcesAtom = atomWithStorage<ListsSourcesByNetwork>(
  'userAddedTokenListsAtom:v3',
  mapSupportedNetworks([]),
  getJotaiMergerStorage(),
)

function getExcludedRwaListKeys(chainId: SupportedChainId): Set<string> {
  return new Set(
    (DEFAULT_TOKENS_LISTS[chainId] || [])
      .filter((list) => list.category === 'RWA')
      .map((list) => getSourceAsKey(list.source)),
  )
}

export const allListsSourcesAtom = atom((get) => {
  const { chainId, isYieldEnabled, excludeRwaLists } = get(environmentAtom)
  const userAddedTokenLists = get(userAddedListsSourcesAtom)
  const userAddedTokenListsForChain = userAddedTokenLists[chainId] || []

  const defaultLists = DEFAULT_TOKENS_LISTS[chainId] || []
  const lpLists = isYieldEnabled ? LP_TOKEN_LISTS : []

  return [
    ...(excludeRwaLists ? defaultLists.filter((list) => list.category !== 'RWA') : defaultLists),
    ...lpLists,
    ...userAddedTokenListsForChain,
  ]
})

// Migrating from localStorage to indexedDB
localStorage.removeItem('allTokenListsInfoAtom:v5')

/**
 * Lists states (user preferences)
 * Note: v6 -> v7 migration is handled by migrateTokenListsFromGithubCdn()
 * Note: v7 -> v8 migration is handled by migrateRetiredTokenLists()
 *
 * @warning any migration or changes to this atom should be accompanied by a reset in tokens:lastUpdateTimeAtom:v6
 */
export const listsStatesByChainAtom = atomWithIdbStorage<TokenListsByChainState>(
  'allTokenListsInfoAtom:v8',
  mapSupportedNetworks({}),
  tokenListsMigrated,
)

export const tokenListsUpdatingAtom = atom<boolean>(false)

/**
 * Virtual lists are created programmatically
 * For example: widget integrators can just pass TokenInfo[] array, and it will be converted to virtual list
 * They are not stored in the local storage and always enabled
 * We also don't show them in the tokens list settings
 */
export const virtualListsStateAtom = atom<TokenListsState>({})

/**
 * Restricted token lists are pinned to a commit and get re-pinned whenever an issuer adds a token.
 * Nothing prunes a source that drops out of the default config, so every re-pin leaves the previous
 * URL behind in storage and the list is rendered twice.
 *
 * `getSourceAsKey` ignores the git ref, so the leftovers are detectable: when several stored sources
 * are the same list, only the URL the app currently ships is surfaced.
 *
 * Applied on read so the UI is never wrong, and again in `upsertListsAtom` so storage converges. It
 * must not be done by writing IndexedDB directly: `listsStatesByChainAtom` loads with `getOnInit` and
 * is re-persisted wholesale on upsert, so a write behind jotai's back is clobbered by the in-memory
 * copy that was read before it.
 */
export function dropRepinnedDuplicates<T>(
  lists: Record<string, T>,
  shipped: readonly { source: string }[],
): Record<string, T> {
  const shippedSources = new Set(shipped.map((list) => list.source))
  const sourceByKey = new Map<string, string>()

  for (const source of Object.keys(lists)) {
    const key = getSourceAsKey(source)
    const kept = sourceByKey.get(key)

    if (kept === undefined || (!shippedSources.has(kept) && shippedSources.has(source))) {
      sourceByKey.set(key, source)
    }
  }

  if (sourceByKey.size === Object.keys(lists).length) {
    return lists
  }

  return Object.fromEntries([...sourceByKey.values()].map((source) => [source, lists[source]]))
}

export const listsStatesMapAtom = atom(async (get) => {
  const { chainId, widgetAppCode, selectedLists, excludeRwaLists } = get(environmentAtom)
  const virtualListsState = get(virtualListsStateAtom)
  const excludedListKeys = excludeRwaLists ? getExcludedRwaListKeys(chainId) : null

  const allTokenListsInfo = await get(listsStatesByChainAtom)
  const listsState = allTokenListsInfo[chainId] || {}

  const storedLists = Object.keys(listsState).reduce<TokenListsState>((acc, key) => {
    const val = listsState[key]

    if (val !== 'deleted' && !excludedListKeys?.has(getSourceAsKey(key))) {
      acc[key] = val
    }

    return acc
  }, {})

  const currentNetworkLists = {
    ...dropRepinnedDuplicates(storedLists, get(allListsSourcesAtom)),
    ...virtualListsState,
  }

  return Object.keys(currentNetworkLists).reduce<{ [source: string]: ListState }>((acc, source) => {
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
