import { migrateRetiredTokenLists } from './migrateRetiredTokenLists'
import { migrateTokenListsFromGithubCdn } from './migrateTokenListsFromGithubCdn'

/**
 * Every migration of the stored lists state, in order: each one reads the key the previous wrote, so a
 * user several versions behind is carried through all of them. Started once, on module load.
 *
 * `listsStatesByChainAtom` awaits this before its first read — see `atomWithIdbStorage`.
 */
export const tokenListsMigrated: Promise<void> = migrateTokenListsFromGithubCdn().then(migrateRetiredTokenLists)
