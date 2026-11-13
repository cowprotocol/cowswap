import { localForageJotai } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ListState, TokenListsByChainState } from '../../types'
import { getSourceAsKey } from '../../utils/getSourceAsKey'

interface RetiredListsStep {
  oldKey: string
  newKey: string
  retiredSources: string[]
}

/**
 * `getSourceAsKey` drops the git ref of a GitHub raw URL, so one entry covers every pin of that file.
 * It only normalizes GitHub raw URLs, so for `files.cow.fi` an old and a new name are different keys
 * and `dropRepinnedDuplicates` cannot pair them up.
 */
const MIGRATION_LOCK_NAME = 'migrateRetiredTokenLists'

const STEPS: RetiredListsStep[] = [
  {
    // `NearSolana.json` was retired, the other two were renamed to the `<Category>.<chainId>.json` convention
    oldKey: 'allTokenListsInfoAtom:v7',
    newKey: 'allTokenListsInfoAtom:v8',
    retiredSources: [
      'https://files.cow.fi/token-lists/NearSolana.json',
      'https://files.cow.fi/token-lists/SolanaDefault.json',
      'https://files.cow.fi/token-lists/SolanaRwa.json',
    ],
  },
  {
    // Issuer RWA lists, replaced by the per-chain `CoinGeckoRwa.<chainId>.json` lists
    oldKey: 'allTokenListsInfoAtom:v8',
    newKey: 'allTokenListsInfoAtom:v9',
    retiredSources: [
      'https://raw.githubusercontent.com/ondoprotocol/cowswap-global-markets-token-list/main/tokenlist.json',
      'https://raw.githubusercontent.com/backed-fi/cowswap-xstocks-tokenlist/main/tokenlist.json',
      'https://raw.githubusercontent.com/InverterNetwork/brix-token-list/main/tokenlist.json',
      'https://raw.githubusercontent.com/afahdenCB/coinbase-tokenized-stocks/main/CowSwap.json',
      'https://raw.githubusercontent.com/ST0x-Technology/st0x.registry/main/token-lists/base.json',
      'https://raw.githubusercontent.com/reserve-protocol/dtf-interface/main/packages/dtf-catalog/tokenlists/index-dtf/restricted/bnb.tokenlist.json',
      'https://files.cow.fi/token-lists/Rwa.1000000001.json',
    ],
  },
]

/**
 * Drops retired list sources from stored lists state, one key bump per step.
 *
 * Nothing prunes a stored list when its source leaves the config: `upsertListsAtom` spreads the stored
 * state back in, and `dropRepinnedDuplicates` only collapses sources sharing a key. Left behind, a
 * retired list keeps rendering in the lists manager with the tokens it held when it was removed.
 *
 * Done as a key bump rather than an in-place rewrite because `listsStatesByChainAtom` loads with
 * `getOnInit` and is re-persisted wholesale on upsert, so a write behind jotai's back is clobbered by
 * the in-memory copy read before it. Nothing has read the new key yet, so there is nothing to clobber.
 *
 * A step no-ops once its key or any later one exists, so it is safe to call on every load: an older
 * build, or a tab still running one, writes the old key again, and migrating that a second time would
 * put its stale state over everything the user has changed since. The old key is left in place for that
 * older build to keep using.
 *
 * Held under a cross-tab lock: two tabs opened together could otherwise both pass the existence check,
 * and the slower one would write its snapshot over the state the faster one has already initialized.
 */
export async function migrateRetiredTokenLists(): Promise<void> {
  await withMigrationLock(async () => {
    for (let index = 0; index < STEPS.length; index++) {
      const laterKeys = STEPS.slice(index).map((step) => step.newKey)

      await runStep(STEPS[index], laterKeys)
    }
  })
}

async function runStep({ oldKey, newKey, retiredSources }: RetiredListsStep, laterKeys: string[]): Promise<void> {
  try {
    for (const key of laterKeys) {
      if (await localForageJotai.getItem(key)) {
        return
      }
    }

    const storedRaw = await localForageJotai.getItem<string>(oldKey)

    if (!storedRaw) {
      return
    }

    const retiredKeys = new Set(retiredSources.map(getSourceAsKey))
    const stored = JSON.parse(storedRaw) as Partial<TokenListsByChainState>
    const migrated: Partial<TokenListsByChainState> = {}

    for (const chainIdStr of Object.keys(stored)) {
      const chainId = Number(chainIdStr) as SupportedChainId
      const chainState = stored[chainId]

      if (!chainState) continue

      const newChainState: { [source: string]: ListState | 'deleted' } = {}

      for (const [source, listState] of Object.entries(chainState)) {
        if (!retiredKeys.has(getSourceAsKey(source))) {
          newChainState[source] = listState
        }
      }

      migrated[chainId] = newChainState
    }

    await localForageJotai.setItem(newKey, JSON.stringify(migrated))
    await localForageJotai.removeItem(oldKey)
  } catch (error) {
    console.error(`[Migration] Failed to drop retired token lists (${oldKey} -> ${newKey}):`, error)
  }
}

async function withMigrationLock(run: () => Promise<void>): Promise<void> {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks

  if (!locks) {
    await run()
    return
  }

  await locks.request(MIGRATION_LOCK_NAME, run)
}
