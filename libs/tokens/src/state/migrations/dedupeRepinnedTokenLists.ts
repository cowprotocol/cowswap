import { localForageJotai } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { getSourceAsKey } from '../../hooks/lists/useIsListBlocked'
import { ListState, TokenListsByChainState } from '../../types'

const STORAGE_KEY = 'allTokenListsInfoAtom:v7'

type ChainListsState = { [source: string]: ListState | 'deleted' }

/**
 * Removes token lists left behind when a list is re-pinned to a new commit.
 *
 * Lists are stored under their URL, and nothing prunes a URL that drops out of the default config.
 * Re-pinning a restricted list therefore leaves the previous URL in storage forever, showing up as a
 * second copy of the same list in the token list manager.
 *
 * `getSourceAsKey` ignores the git ref, so the leftovers are detectable: when several stored sources
 * share a key they are the same list, and only the URL the app currently ships is kept.
 *
 * Runs on every start rather than once, because re-pinning happens whenever an issuer adds a token.
 */
export async function dedupeRepinnedTokenLists(): Promise<void> {
  try {
    const raw = await localForageJotai.getItem<string>(STORAGE_KEY)
    if (!raw) {
      return
    }

    const data = JSON.parse(raw) as Partial<TokenListsByChainState>
    let removedCount = 0

    for (const chainIdStr of Object.keys(data)) {
      const chainId = Number(chainIdStr) as SupportedChainId
      const chainState = data[chainId]

      if (!chainState) continue

      removedCount += dedupeChain(chainState, chainId)
    }

    if (!removedCount) {
      return
    }

    await localForageJotai.setItem(STORAGE_KEY, JSON.stringify(data))

    console.log(`[Migration] Removed ${removedCount} re-pinned token list duplicate(s)`)
  } catch (error) {
    console.error('[Migration] Failed to dedupe re-pinned token lists:', error)
  }
}

function dedupeChain(chainState: ChainListsState, chainId: SupportedChainId): number {
  const currentSources = new Set((DEFAULT_TOKENS_LISTS[chainId] || []).map((list) => list.source.toLowerCase().trim()))

  const sourcesByKey = new Map<string, string[]>()

  for (const source of Object.keys(chainState)) {
    const key = getSourceAsKey(source)
    const sources = sourcesByKey.get(key)

    if (sources) {
      sources.push(source)
    } else {
      sourcesByKey.set(key, [source])
    }
  }

  let removedCount = 0

  for (const sources of sourcesByKey.values()) {
    if (sources.length < 2) continue

    const keep = sources.find((source) => currentSources.has(source.toLowerCase().trim())) ?? sources[0]

    for (const source of sources) {
      if (source === keep) continue

      delete chainState[source]
      removedCount++
    }
  }

  return removedCount
}
