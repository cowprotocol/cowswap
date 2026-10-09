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

const OLD_KEY = 'allTokenListsInfoAtom:v7'
const NEW_KEY = 'allTokenListsInfoAtom:v8'

const RETIRED_SOURCE = 'https://files.cow.fi/token-lists/NearSolana.json'
const RENAMED_SOURCE = 'https://files.cow.fi/token-lists/SolanaDefault.json'
const LIVE_SOURCE = 'https://files.cow.fi/token-lists/CowSwap.1000000001.json'

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
  return JSON.parse(mockStorage.get(NEW_KEY) as string)
}

describe('migrateRetiredTokenLists', () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  it('drops retired and renamed sources while keeping the rest', async () => {
    mockStorage.set(
      OLD_KEY,
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
    expect(mockStorage.has(OLD_KEY)).toBe(false)
  })

  // Sources are stored verbatim while `getSourceAsKey` lower-cases, so matching has to go through it
  it('matches a retired source regardless of casing', async () => {
    const upperCased = RETIRED_SOURCE.toUpperCase()

    mockStorage.set(OLD_KEY, JSON.stringify({ [SupportedChainId.SOLANA]: { [upperCased]: listState(upperCased) } }))

    await migrateRetiredTokenLists()

    expect(readMigrated()[SupportedChainId.SOLANA]).toEqual({})
  })

  it('keeps entries marked as deleted, so a list the user removed does not come back', async () => {
    mockStorage.set(OLD_KEY, JSON.stringify({ [SupportedChainId.MAINNET]: { [LIVE_SOURCE]: 'deleted' } }))

    await migrateRetiredTokenLists()

    expect(readMigrated()[SupportedChainId.MAINNET]).toEqual({ [LIVE_SOURCE]: 'deleted' })
  })

  it('does nothing when there is no v7 state to migrate', async () => {
    await migrateRetiredTokenLists()

    expect(mockStorage.has(NEW_KEY)).toBe(false)
  })

  // A half-written or hand-edited value must not take the whole lists state down with it
  it('leaves v7 in place when it cannot be parsed', async () => {
    mockStorage.set(OLD_KEY, 'not json')

    await migrateRetiredTokenLists()

    expect(mockStorage.has(NEW_KEY)).toBe(false)
    expect(mockStorage.get(OLD_KEY)).toBe('not json')
  })
})
