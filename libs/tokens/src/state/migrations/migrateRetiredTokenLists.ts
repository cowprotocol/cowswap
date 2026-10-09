import { localForageJotai } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { getSourceAsKey } from '../../hooks/lists/useIsListBlocked'
import { ListState, TokenListsByChainState } from '../../types'

const OLD_STORAGE_KEY = 'allTokenListsInfoAtom:v7'
const NEW_STORAGE_KEY = 'allTokenListsInfoAtom:v8'

/**
 * Sources that no longer exist: `NearSolana.json` was retired, the other two were renamed to the
 * `<Category>.<chainId>.json` convention.
 *
 * `getSourceAsKey` only normalizes GitHub raw URLs, so for `files.cow.fi` an old and a new name are
 * different keys and `dropRepinnedDuplicates` cannot pair them up.
 */
const RETIRED_SOURCE_KEYS = new Set(
  [
    'https://files.cow.fi/token-lists/NearSolana.json',
    'https://files.cow.fi/token-lists/SolanaDefault.json',
    'https://files.cow.fi/token-lists/SolanaRwa.json',
  ].map(getSourceAsKey),
)

/**
 * Drops retired list sources from stored lists state (v7 -> v8).
 *
 * Nothing prunes a stored list when its source leaves the config: `upsertListsAtom` spreads the stored
 * state back in, and `dropRepinnedDuplicates` only collapses sources sharing a key. Left behind, a
 * retired list keeps rendering in the lists manager with the tokens it held when it was removed.
 *
 * Done as a key bump rather than an in-place rewrite because `listsStatesByChainAtom` loads with
 * `getOnInit` and is re-persisted wholesale on upsert, so a write behind jotai's back is clobbered by
 * the in-memory copy read before it. Nothing has read v8 yet, so there is nothing to clobber.
 */
export async function migrateRetiredTokenLists(): Promise<void> {
  try {
    const storedRaw = await localForageJotai.getItem<string>(OLD_STORAGE_KEY)

    if (!storedRaw) {
      return
    }

    const stored = JSON.parse(storedRaw) as Partial<TokenListsByChainState>
    const migrated: Partial<TokenListsByChainState> = {}

    for (const chainIdStr of Object.keys(stored)) {
      const chainId = Number(chainIdStr) as SupportedChainId
      const chainState = stored[chainId]

      if (!chainState) continue

      const newChainState: { [source: string]: ListState | 'deleted' } = {}

      for (const [source, listState] of Object.entries(chainState)) {
        if (!RETIRED_SOURCE_KEYS.has(getSourceAsKey(source))) {
          newChainState[source] = listState
        }
      }

      migrated[chainId] = newChainState
    }

    await localForageJotai.setItem(NEW_STORAGE_KEY, JSON.stringify(migrated))
    await localForageJotai.removeItem(OLD_STORAGE_KEY)
  } catch (error) {
    console.error('[Migration] Failed to drop retired token lists (v7 -> v8):', error)
  }
}
