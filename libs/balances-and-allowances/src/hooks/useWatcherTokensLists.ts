import { useMemo } from 'react'

import { AddressKey, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAllListsList, useListsEnabledState, useVirtualLists } from '@cowprotocol/tokens'

const EMPTY_URLS: string[] = []
const EMPTY_TOKENS: AddressKey[] = []

export interface WatcherTokensLists {
  /** Enabled list urls the watcher still has to fetch for itself. */
  tokensListsUrls: string[]
  /** Addresses of the enabled lists this client has already parsed, for the given chain. */
  listsTokens: AddressKey[]
}

/**
 * Splits the enabled token lists into the ones the BalancesWatcher still has to download and the
 * tokens of the ones already held here.
 *
 * The watcher fetches every url it is handed, so passing a list this client has already parsed
 * makes it download the same file a second time. Those lists travel as plain addresses instead —
 * the watched set is identical either way, since the watcher resolves urls to the same addresses.
 *
 * Both halves are produced together so the url side and the address side cannot disagree about
 * which lists are already covered.
 */
export function useWatcherTokensLists(chainId: SupportedChainId): WatcherTokensLists {
  const enabledState = useListsEnabledState()
  const virtualLists = useVirtualLists()
  // Virtual lists are filtered out of this already; their tokens come from `useCustomTokensForChain`
  const allLists = useAllListsList()

  return useMemo(() => {
    const coveredSources = new Set<string>()
    const addresses = new Set<AddressKey>()

    for (const list of allLists) {
      const tokens = list.list.tokens

      /*
       * An entry with no tokens at all is a list that never loaded — a failed fetch leaves the
       * state behind. Leaving it on the url side lets the watcher try the download itself rather
       * than silently dropping the list from the watched set.
       */
      if (enabledState[list.source] !== true || tokens.length === 0) continue

      coveredSources.add(list.source)

      for (const token of tokens) {
        if (token.chainId === chainId) {
          addresses.add(getAddressKey(token.address))
        }
      }
    }

    // Virtual list sources are internal identifiers rather than fetchable urls, so they never
    // belong on the url side regardless of whether their tokens were collected above
    const urls = Object.entries(enabledState)
      .filter(([source, enabled]) => enabled === true && !virtualLists[source] && !coveredSources.has(source))
      .map(([source]) => source)
      .sort()

    return {
      tokensListsUrls: urls.length === 0 ? EMPTY_URLS : urls,
      listsTokens: addresses.size === 0 ? EMPTY_TOKENS : Array.from(addresses).sort(),
    }
  }, [enabledState, virtualLists, allLists, chainId])
}
