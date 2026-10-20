import { useMemo } from 'react'

import { isWatcherUnfetchableListSource } from '@cowprotocol/common-utils'
import { AddressKey, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAllListsList, useListsEnabledState, useVirtualLists } from '@cowprotocol/tokens'

const EMPTY_URLS: string[] = []
const EMPTY_TOKENS: AddressKey[] = []

export interface WatcherTokensLists {
  /** Enabled list urls the watcher can fetch for itself. */
  tokensListsUrls: string[]
  /** Addresses of the enabled lists the watcher cannot fetch, taken from this client's copy. */
  listsTokens: AddressKey[]
}

/**
 * Keeps sources the BalancesWatcher cannot fetch out of `tokensListsUrls`, passing their tokens as
 * plain addresses instead.
 *
 * The watcher runs every url through an SSRF guard that admits http(s) only, and resolves the whole
 * set with `try_join_all` — so a single `ipfs://` source fails the entire session request with a
 * 400, and the client then retries it every 30s forever while balances sit on the multicall
 * fallback. This browser reaches those lists through an http gateway (`uriToHttp`), so their tokens
 * are already here and can be sent by address.
 *
 * Both halves come from one hook so a source lands on exactly one side.
 */
export function useWatcherTokensLists(chainId: SupportedChainId): WatcherTokensLists {
  const enabledState = useListsEnabledState()
  const virtualLists = useVirtualLists()
  // Virtual lists are filtered out of this already; their tokens come from `useCustomTokensForChain`
  const allLists = useAllListsList()

  return useMemo(() => {
    const addresses = new Set<AddressKey>()

    for (const list of allLists) {
      if (enabledState[list.source] !== true || !isWatcherUnfetchableListSource(list.source)) continue

      for (const token of list.list.tokens) {
        if (token.chainId === chainId) {
          addresses.add(getAddressKey(token.address))
        }
      }
    }

    /*
     * An unfetchable source this client has not loaded contributes nothing: there are no addresses
     * to send and handing over the url would fail the session. Dropping one list's balances beats
     * losing every balance.
     */
    const urls = Object.entries(enabledState)
      .filter(
        ([source, enabled]) => enabled === true && !virtualLists[source] && !isWatcherUnfetchableListSource(source),
      )
      .map(([source]) => source)
      .sort()

    return {
      tokensListsUrls: urls.length === 0 ? EMPTY_URLS : urls,
      listsTokens: addresses.size === 0 ? EMPTY_TOKENS : Array.from(addresses).sort(),
    }
  }, [enabledState, virtualLists, allLists, chainId])
}
