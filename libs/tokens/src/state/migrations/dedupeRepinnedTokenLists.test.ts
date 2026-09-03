import { SupportedChainId } from '@cowprotocol/cow-sdk'

const mockStore = new Map<string, string>()

jest.mock('@cowprotocol/core', () => ({
  ...jest.requireActual('@cowprotocol/core'),
  localForageJotai: {
    getItem: async (key: string): Promise<string | null> => mockStore.get(key) ?? null,
    setItem: async (key: string, value: string): Promise<string> => {
      mockStore.set(key, value)
      return value
    },
  },
}))

import { dedupeRepinnedTokenLists } from './dedupeRepinnedTokenLists'

import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'

const STORAGE_KEY = 'allTokenListsInfoAtom:v7'
const CHAIN_ID = SupportedChainId.BNB
const UNRELATED_SOURCE = 'https://files.cow.fi/token-lists/CoinGecko.56.json'

// The pinned URL the app currently ships, and the branch-ref URL it replaced
const PINNED_SOURCE = DEFAULT_TOKENS_LISTS[CHAIN_ID].find((list) => list.source.includes('ondoprotocol'))!.source
const STALE_SOURCE = PINNED_SOURCE.replace(
  /^(https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/)[^/]+\//,
  '$1refs/heads/main/',
)

function listState(source: string): { source: string; list: { name: string } } {
  return { source, list: { name: source } }
}

async function readStored(): Promise<Record<string, Record<string, unknown>>> {
  return JSON.parse(mockStore.get(STORAGE_KEY)!)
}

describe('dedupeRepinnedTokenLists', () => {
  beforeEach(() => mockStore.clear())

  it('sanity check: the two sources differ only by git ref', () => {
    expect(STALE_SOURCE).not.toBe(PINNED_SOURCE)
    expect(STALE_SOURCE).toContain('refs/heads/main')
  })

  it('drops the re-pinned leftover and keeps the shipped URL', async () => {
    mockStore.set(
      STORAGE_KEY,
      JSON.stringify({
        [CHAIN_ID]: {
          [STALE_SOURCE]: listState(STALE_SOURCE),
          [PINNED_SOURCE]: listState(PINNED_SOURCE),
          [UNRELATED_SOURCE]: listState(UNRELATED_SOURCE),
        },
      }),
    )

    await dedupeRepinnedTokenLists()

    expect(Object.keys((await readStored())[CHAIN_ID])).toEqual([PINNED_SOURCE, UNRELATED_SOURCE])
  })

  it('leaves storage untouched when there is nothing to dedupe', async () => {
    const stored = JSON.stringify({ [CHAIN_ID]: { [PINNED_SOURCE]: listState(PINNED_SOURCE) } })
    mockStore.set(STORAGE_KEY, stored)

    await dedupeRepinnedTokenLists()

    expect(mockStore.get(STORAGE_KEY)).toBe(stored)
  })

  it('keeps one entry when no stored URL is the shipped one', async () => {
    const olderStale = STALE_SOURCE.replace('refs/heads/main', 'refs/heads/master')

    mockStore.set(
      STORAGE_KEY,
      JSON.stringify({
        [CHAIN_ID]: {
          [STALE_SOURCE]: listState(STALE_SOURCE),
          [olderStale]: listState(olderStale),
        },
      }),
    )

    await dedupeRepinnedTokenLists()

    expect(Object.keys((await readStored())[CHAIN_ID])).toEqual([STALE_SOURCE])
  })
})
