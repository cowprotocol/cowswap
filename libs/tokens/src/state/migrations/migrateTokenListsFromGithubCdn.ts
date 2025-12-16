import { localForageJotai } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ListState, TokenListsByChainState } from '../../types'

const OLD_STORAGE_KEY = 'allTokenListsInfoAtom:v6'
const NEW_STORAGE_KEY = 'allTokenListsInfoAtom:v7'

const GITHUB_RAW_PREFIXES = [
  'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/',
  'https://raw.githubusercontent.com/cowprotocol/token-lists/refs/heads/main/src/public/',
]

// TODO: remove after 01.06.2026
/**
 * Migrates token lists from GitHub CDN URLs to COW CDN URLs.
 *
 * Previously, token lists were stored with URLs like:
 * - `https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/CoinGecko.1.json`
 * - `https://raw.githubusercontent.com/cowprotocol/token-lists/refs/heads/main/src/public/CoinGecko.1.json`
 *
 * Now they use the CDN:
 * `https://files.cow.fi/token-lists/CoinGecko.1.json`
 *
 * This migration:
 * 1. Reads the v6 data from IndexedDB
 * 2. Copies over only the lists that are not from GitHub CDN
 * 3. The new lists will be loaded from the default configuration
 * 4. Saves as v7
 */
export async function migrateTokenListsFromGithubCdn(): Promise<void> {
  try {
    const v6DataRaw = await localForageJotai.getItem<string>(OLD_STORAGE_KEY)
    if (!v6DataRaw) {
      return
    }

    const v6Data = JSON.parse(v6DataRaw) as Partial<TokenListsByChainState>
    const v7Data: Partial<TokenListsByChainState> = {}

    for (const chainIdStr of Object.keys(v6Data)) {
      const chainId = Number(chainIdStr) as SupportedChainId
      const chainState = v6Data[chainId]

      if (!chainState) continue

      const newChainState: { [source: string]: ListState | 'deleted' } = {}

      for (const [source, listState] of Object.entries(chainState)) {
        const isGithubTokenListUrl = GITHUB_RAW_PREFIXES.some((prefix) => source.startsWith(prefix))
        if (!isGithubTokenListUrl) {
          newChainState[source] = listState
        }
      }

      v7Data[chainId] = newChainState
    }

    await localForageJotai.setItem(NEW_STORAGE_KEY, JSON.stringify(v7Data))
    await localForageJotai.removeItem(OLD_STORAGE_KEY)

    console.log('[Migration] Successfully migrated token lists from GitHub CDN (v6 -> v7)')
  } catch (error) {
    console.error('[Migration] Failed to migrate token lists from GitHub CDN:', error)
  }
}
