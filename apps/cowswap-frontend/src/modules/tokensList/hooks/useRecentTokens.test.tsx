import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, renderHook } from '@testing-library/react'

import { useRecentTokens } from './useRecentTokens'

import { recentTokensStorageAtom } from '../state/recentTokensStorageAtom'
import {
  RECENT_TOKENS_STORAGE_KEY,
  readStoredTokens,
  RECENT_TOKENS_LIMIT,
  StoredRecentToken,
} from '../utils/recentTokensStorage'

// Test addresses
const ADDRESS_1 = '0x1111111111111111111111111111111111111111'
const ADDRESS_2 = '0x2222222222222222222222222222222222222222'
const ADDRESS_3 = '0x3333333333333333333333333333333333333333'

const DEFAULT_DECIMALS = 18

function createTestToken(chainId: number, address: string, symbol: string): TokenWithLogo {
  return new TokenWithLogo(undefined, chainId, address, DEFAULT_DECIMALS, symbol, `${symbol} Token`, undefined, [])
}

function createStoredToken(chainId: number, address: string, symbol?: string): StoredRecentToken {
  return { chainId, address, decimals: DEFAULT_DECIMALS, symbol }
}

function setStoredTokens(tokens: Record<number, StoredRecentToken[]>): void {
  localStorage.setItem(RECENT_TOKENS_STORAGE_KEY, JSON.stringify(tokens))
}

function createTestWrapper(store: ReturnType<typeof createStore>) {
  return function TestWrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }
}

function createStoreWithLocalStorage(): ReturnType<typeof createStore> {
  const store = createStore()
  // Initialize atom with current localStorage state
  store.set(recentTokensStorageAtom, readStoredTokens(RECENT_TOKENS_LIMIT))
  return store
}

describe('useRecentTokens', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty array when no stored tokens', () => {
    const store = createStoreWithLocalStorage()
    const wrapper = createTestWrapper(store)

    const { result } = renderHook(
      () =>
        useRecentTokens({
          allTokens: [],
          favoriteTokens: [],
          activeChainId: SupportedChainId.MAINNET,
        }),
      { wrapper },
    )

    expect(result.current.recentTokens).toEqual([])
  })

  it('returns recent tokens for the active chain', () => {
    const token = createTestToken(SupportedChainId.MAINNET, ADDRESS_1, 'TKN')

    setStoredTokens({
      [SupportedChainId.MAINNET]: [createStoredToken(SupportedChainId.MAINNET, ADDRESS_1, 'TKN')],
    })
    const store = createStoreWithLocalStorage()
    const wrapper = createTestWrapper(store)

    const { result } = renderHook(
      () =>
        useRecentTokens({
          allTokens: [token],
          favoriteTokens: [],
          activeChainId: SupportedChainId.MAINNET,
        }),
      { wrapper },
    )

    expect(result.current.recentTokens).toHaveLength(1)
    expect(result.current.recentTokens[0].symbol).toBe('TKN')
  })

  it('does not return tokens from other chains', () => {
    setStoredTokens({
      [SupportedChainId.GNOSIS_CHAIN]: [createStoredToken(SupportedChainId.GNOSIS_CHAIN, ADDRESS_1, 'TKN')],
    })
    const store = createStoreWithLocalStorage()
    const wrapper = createTestWrapper(store)

    const { result } = renderHook(
      () =>
        useRecentTokens({
          allTokens: [],
          favoriteTokens: [],
          activeChainId: SupportedChainId.MAINNET,
        }),
      { wrapper },
    )

    expect(result.current.recentTokens).toEqual([])
  })

  it('filters out favorite tokens from recent tokens', () => {
    const favoriteToken = createTestToken(SupportedChainId.MAINNET, ADDRESS_1, 'FAV')
    const regularToken = createTestToken(SupportedChainId.MAINNET, ADDRESS_2, 'REG')

    setStoredTokens({
      [SupportedChainId.MAINNET]: [
        createStoredToken(SupportedChainId.MAINNET, ADDRESS_1),
        createStoredToken(SupportedChainId.MAINNET, ADDRESS_2),
      ],
    })
    const store = createStoreWithLocalStorage()
    const wrapper = createTestWrapper(store)

    const { result } = renderHook(
      () =>
        useRecentTokens({
          allTokens: [favoriteToken, regularToken],
          favoriteTokens: [favoriteToken],
          activeChainId: SupportedChainId.MAINNET,
        }),
      { wrapper },
    )

    expect(result.current.recentTokens).toHaveLength(1)
    expect(result.current.recentTokens[0].address.toLowerCase()).toBe(ADDRESS_2)
  })

  it('addRecentToken adds a token to the list', () => {
    const store = createStoreWithLocalStorage()
    const wrapper = createTestWrapper(store)

    const token = createTestToken(SupportedChainId.MAINNET, ADDRESS_1, 'NEW')

    const { result } = renderHook(
      () =>
        useRecentTokens({
          allTokens: [token],
          favoriteTokens: [],
          activeChainId: SupportedChainId.MAINNET,
        }),
      { wrapper },
    )

    expect(result.current.recentTokens).toHaveLength(0)

    act(() => {
      result.current.addRecentToken(token)
    })

    expect(result.current.recentTokens).toHaveLength(1)
    expect(result.current.recentTokens[0].symbol).toBe('NEW')
  })

  it('addRecentToken does not add favorite tokens', () => {
    const store = createStoreWithLocalStorage()
    const wrapper = createTestWrapper(store)

    const favoriteToken = createTestToken(SupportedChainId.MAINNET, ADDRESS_1, 'FAV')

    const { result } = renderHook(
      () =>
        useRecentTokens({
          allTokens: [favoriteToken],
          favoriteTokens: [favoriteToken],
          activeChainId: SupportedChainId.MAINNET,
        }),
      { wrapper },
    )

    act(() => {
      result.current.addRecentToken(favoriteToken)
    })

    expect(result.current.recentTokens).toHaveLength(0)
  })

  it('clearRecentTokens clears tokens for the active chain', () => {
    const token = createTestToken(SupportedChainId.MAINNET, ADDRESS_1, 'TKN')

    setStoredTokens({
      [SupportedChainId.MAINNET]: [createStoredToken(SupportedChainId.MAINNET, ADDRESS_1)],
    })
    const store = createStoreWithLocalStorage()
    const wrapper = createTestWrapper(store)

    const { result } = renderHook(
      () =>
        useRecentTokens({
          allTokens: [token],
          favoriteTokens: [],
          activeChainId: SupportedChainId.MAINNET,
        }),
      { wrapper },
    )

    expect(result.current.recentTokens).toHaveLength(1)

    act(() => {
      result.current.clearRecentTokens()
    })

    expect(result.current.recentTokens).toHaveLength(0)
  })

  it('respects maxItems limit', () => {
    setStoredTokens({
      [SupportedChainId.MAINNET]: [
        createStoredToken(SupportedChainId.MAINNET, ADDRESS_1),
        createStoredToken(SupportedChainId.MAINNET, ADDRESS_2),
        createStoredToken(SupportedChainId.MAINNET, ADDRESS_3),
      ],
    })
    const store = createStoreWithLocalStorage()
    const wrapper = createTestWrapper(store)

    const tokens = [
      createTestToken(SupportedChainId.MAINNET, ADDRESS_1, 'T1'),
      createTestToken(SupportedChainId.MAINNET, ADDRESS_2, 'T2'),
      createTestToken(SupportedChainId.MAINNET, ADDRESS_3, 'T3'),
    ]

    const { result } = renderHook(
      () =>
        useRecentTokens({
          allTokens: tokens,
          favoriteTokens: [],
          activeChainId: SupportedChainId.MAINNET,
          maxItems: 2,
        }),
      { wrapper },
    )

    expect(result.current.recentTokens).toHaveLength(2)
  })
})
