import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { migrateRetiredTokenLists } from './migrateRetiredTokenLists'

import { ListState } from '../../types'

const mockStorage = new Map<string, string>()

jest.mock('@cowprotocol/core', () => ({
  ...jest.requireActual('@cowprotocol/core'),
  localForageJotai: {
    getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage.set(key, value)
    }),
    removeItem: jest.fn(async (key: string) => {
      mockStorage.delete(key)
    }),
  },
}))

const V7_KEY = 'allTokenListsInfoAtom:v7'
const V8_KEY = 'allTokenListsInfoAtom:v8'
const LATEST_KEY = 'allTokenListsInfoAtom:v9'

const RETIRED_SOURCE = 'https://files.cow.fi/token-lists/NearSolana.json'
const RENAMED_SOURCE = 'https://files.cow.fi/token-lists/SolanaDefault.json'
const LIVE_SOURCE = 'https://files.cow.fi/token-lists/CowSwap.1000000001.json'
const RETIRED_RWA_SOURCE = 'https://files.cow.fi/token-lists/Rwa.1000000001.json'
const RETIRED_PINNED_RWA_SOURCE = `https://raw.githubusercontent.com/backed-fi/cowswap-xstocks-tokenlist/${'c'.repeat(40)}/tokenlist.json`
const LIVE_RWA_SOURCE = 'https://files.cow.fi/token-lists/CoinGeckoRwa.1000000001.json'

function listState(source: string): ListState {
  return {
    source,
    priority: 1,
    isEnabled: true,
    list: {
      name: source,
      timestamp: '2024-01-01T00:00:00Z',
      version: { major: 1, minor: 0, patch: 0 },
      tokens: [],
    },
  }
}

function readMigrated(): Record<string, Record<string, ListState | 'deleted'>> {
  return JSON.parse(mockStorage.get(LATEST_KEY) as string)
}

describe('migrateRetiredTokenLists', () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  it('drops retired and renamed sources while keeping the rest', async () => {
    mockStorage.set(
      V7_KEY,
      JSON.stringify({
        [SupportedChainId.SOLANA]: {
          [RETIRED_SOURCE]: listState(RETIRED_SOURCE),
          [RENAMED_SOURCE]: listState(RENAMED_SOURCE),
          [LIVE_SOURCE]: listState(LIVE_SOURCE),
        },
      }),
    )

    await migrateRetiredTokenLists()

    expect(Object.keys(readMigrated()[SupportedChainId.SOLANA])).toEqual([LIVE_SOURCE])
    expect(mockStorage.has(V7_KEY)).toBe(false)
    expect(mockStorage.has(V8_KEY)).toBe(false)
  })

  it('drops the retired RWA lists, whatever commit they are pinned to', async () => {
    mockStorage.set(
      V8_KEY,
      JSON.stringify({
        [SupportedChainId.SOLANA]: {
          [RETIRED_RWA_SOURCE]: listState(RETIRED_RWA_SOURCE),
          [LIVE_RWA_SOURCE]: listState(LIVE_RWA_SOURCE),
        },
        [SupportedChainId.MAINNET]: {
          [RETIRED_PINNED_RWA_SOURCE]: listState(RETIRED_PINNED_RWA_SOURCE),
        },
      }),
    )

    await migrateRetiredTokenLists()

    expect(Object.keys(readMigrated()[SupportedChainId.SOLANA])).toEqual([LIVE_RWA_SOURCE])
    expect(readMigrated()[SupportedChainId.MAINNET]).toEqual({})
    expect(mockStorage.has(V8_KEY)).toBe(false)
  })

  it('carries v7 state through every step', async () => {
    mockStorage.set(
      V7_KEY,
      JSON.stringify({
        [SupportedChainId.SOLANA]: {
          [RETIRED_SOURCE]: listState(RETIRED_SOURCE),
          [RETIRED_RWA_SOURCE]: listState(RETIRED_RWA_SOURCE),
          [LIVE_SOURCE]: listState(LIVE_SOURCE),
        },
      }),
    )

    await migrateRetiredTokenLists()

    expect(Object.keys(readMigrated()[SupportedChainId.SOLANA])).toEqual([LIVE_SOURCE])
  })

  // Sources are stored verbatim while `getSourceAsKey` lower-cases, so matching has to go through it
  it('matches a retired source regardless of casing', async () => {
    const upperCased = RETIRED_SOURCE.toUpperCase()

    mockStorage.set(V7_KEY, JSON.stringify({ [SupportedChainId.SOLANA]: { [upperCased]: listState(upperCased) } }))

    await migrateRetiredTokenLists()

    expect(readMigrated()[SupportedChainId.SOLANA]).toEqual({})
  })

  it('keeps entries marked as deleted, so a list the user removed does not come back', async () => {
    mockStorage.set(V7_KEY, JSON.stringify({ [SupportedChainId.MAINNET]: { [LIVE_SOURCE]: 'deleted' } }))

    await migrateRetiredTokenLists()

    expect(readMigrated()[SupportedChainId.MAINNET]).toEqual({ [LIVE_SOURCE]: 'deleted' })
  })

  // An older build, or a tab still running one, writes an old key again after the migration already ran.
  // Migrating it a second time would put that stale state over everything changed since.
  it.each([V7_KEY, V8_KEY])(
    'leaves the latest state untouched when an older build has recreated %s',
    async (oldKey) => {
      const alreadyMigrated = { [SupportedChainId.SOLANA]: { [LIVE_SOURCE]: listState(LIVE_SOURCE) } }

      mockStorage.set(LATEST_KEY, JSON.stringify(alreadyMigrated))
      mockStorage.set(
        oldKey,
        JSON.stringify({ [SupportedChainId.SOLANA]: { [RETIRED_SOURCE]: listState(RETIRED_SOURCE) } }),
      )

      await migrateRetiredTokenLists()

      expect(readMigrated()).toEqual(alreadyMigrated)
      expect(mockStorage.has(oldKey)).toBe(true)
      expect(mockStorage.has(oldKey === V7_KEY ? V8_KEY : V7_KEY)).toBe(false)
    },
  )

  describe('with a cross-tab lock', () => {
    let queue: Promise<unknown>

    beforeEach(() => {
      queue = Promise.resolve()

      Object.defineProperty(navigator, 'locks', {
        configurable: true,
        value: {
          request: jest.fn((_name: string, run: () => Promise<void>) => {
            const result = queue.then(run)
            queue = result
            return result
          }),
        },
      })
    })

    afterEach(() => {
      Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined })
    })

    it('lets only the first of two concurrent tabs write the migrated state', async () => {
      mockStorage.set(V8_KEY, JSON.stringify({ [SupportedChainId.SOLANA]: { [LIVE_SOURCE]: listState(LIVE_SOURCE) } }))

      const setItem = jest.requireMock('@cowprotocol/core').localForageJotai.setItem as jest.Mock
      setItem.mockClear()

      await Promise.all([migrateRetiredTokenLists(), migrateRetiredTokenLists()])

      expect(setItem.mock.calls.filter(([key]) => key === LATEST_KEY)).toHaveLength(1)
    })
  })

  it('does nothing when there is no old state to migrate', async () => {
    await migrateRetiredTokenLists()

    expect(mockStorage.size).toBe(0)
  })

  // A half-written or hand-edited value must not take the whole lists state down with it
  it('leaves v7 in place when it cannot be parsed', async () => {
    mockStorage.set(V7_KEY, 'not json')

    await migrateRetiredTokenLists()

    expect(mockStorage.has(V8_KEY)).toBe(false)
    expect(mockStorage.has(LATEST_KEY)).toBe(false)
    expect(mockStorage.get(V7_KEY)).toBe('not json')
  })
})
