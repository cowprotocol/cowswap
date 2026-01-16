import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { getTokenId } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, renderHook } from '@testing-library/react'

import { useRecentTokensStorage } from './useRecentTokensStorage'

import { recentTokensStorageAtom } from '../state/recentTokensStorageAtom'
import {
  RECENT_TOKENS_STORAGE_KEY,
  readStoredTokens,
  RECENT_TOKENS_LIMIT,
  StoredRecentToken,
  StoredRecentTokensByChain,
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

function setStoredTokens(tokens: StoredRecentTokensByChain): void {
  localStorage.setItem(RECENT_TOKENS_STORAGE_KEY, JSON.stringify(tokens))
}

function getTokenKey(chainId: number, address: string): string {
  return getTokenId({ chainId, address })
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

describe('useRecentTokensStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('initial state', () => {
    it('returns empty object when localStorage is empty', () => {
      const store = createStoreWithLocalStorage()
      const wrapper = createTestWrapper(store)

      const { result } = renderHook(
        () =>
          useRecentTokensStorage({
            favoriteKeys: new Set(),
          }),
        { wrapper },
      )

      expect(result.current.storedTokensByChain).toEqual({})
    })

    it('loads stored tokens from localStorage', () => {
      const storedData: StoredRecentTokensByChain = {
        [SupportedChainId.MAINNET]: [createStoredToken(SupportedChainId.MAINNET, ADDRESS_1, 'TKN')],
      }
      setStoredTokens(storedData)
      const store = createStoreWithLocalStorage()
      const wrapper = createTestWrapper(store)

      const { result } = renderHook(
        () =>
          useRecentTokensStorage({
            favoriteKeys: new Set(),
          }),
        { wrapper },
      )

      expect(result.current.storedTokensByChain[SupportedChainId.MAINNET]).toHaveLength(1)
      expect(result.current.storedTokensByChain[SupportedChainId.MAINNET][0].address).toBe(ADDRESS_1)
    })

    it('loads tokens from multiple chains', () => {
      const storedData: StoredRecentTokensByChain = {
        [SupportedChainId.MAINNET]: [createStoredToken(SupportedChainId.MAINNET, ADDRESS_1)],
        [SupportedChainId.GNOSIS_CHAIN]: [createStoredToken(SupportedChainId.GNOSIS_CHAIN, ADDRESS_2)],
      }
      setStoredTokens(storedData)
      const store = createStoreWithLocalStorage()
      const wrapper = createTestWrapper(store)

      const { result } = renderHook(
        () =>
          useRecentTokensStorage({
            favoriteKeys: new Set(),
          }),
        { wrapper },
      )

      expect(result.current.storedTokensByChain[SupportedChainId.MAINNET]).toHaveLength(1)
      expect(result.current.storedTokensByChain[SupportedChainId.GNOSIS_CHAIN]).toHaveLength(1)
    })
  })

  describe('addRecentToken', () => {
    it('adds a token to the stored tokens', () => {
      const store = createStoreWithLocalStorage()
      const wrapper = createTestWrapper(store)

      const { result } = renderHook(
        () =>
          useRecentTokensStorage({
            favoriteKeys: new Set(),
          }),
        { wrapper },
      )

      const token = createTestToken(SupportedChainId.MAINNET, ADDRESS_1, 'NEW')

      act(() => {
        result.current.addRecentToken(token)
      })

      expect(result.current.storedTokensByChain[SupportedChainId.MAINNET]).toHaveLength(1)
      expect(result.current.storedTokensByChain[SupportedChainId.MAINNET][0].address).toBe(ADDRESS_1.toLowerCase())
    })

    it('does not add favorite tokens', () => {
      const store = createStoreWithLocalStorage()
      const wrapper = createTestWrapper(store)

      const favoriteKeys = new Set([getTokenKey(SupportedChainId.MAINNET, ADDRESS_1)])

      const { result } = renderHook(
        () =>
          useRecentTokensStorage({
            favoriteKeys,
          }),
        { wrapper },
      )

      const token = createTestToken(SupportedChainId.MAINNET, ADDRESS_1, 'FAV')

      act(() => {
        result.current.addRecentToken(token)
      })

      expect(result.current.storedTokensByChain[SupportedChainId.MAINNET]).toBeUndefined()
    })

    it('moves existing token to the front', () => {
      const storedData: StoredRecentTokensByChain = {
        [SupportedChainId.MAINNET]: [
          createStoredToken(SupportedChainId.MAINNET, ADDRESS_1, 'T1'),
          createStoredToken(SupportedChainId.MAINNET, ADDRESS_2, 'T2'),
        ],
      }
      setStoredTokens(storedData)
      const store = createStoreWithLocalStorage()
      const wrapper = createTestWrapper(store)

      const { result } = renderHook(
        () =>
          useRecentTokensStorage({
            favoriteKeys: new Set(),
          }),
        { wrapper },
      )

      // Add TOKEN_2 again - should move to front
      const token = createTestToken(SupportedChainId.MAINNET, ADDRESS_2, 'T2')

      act(() => {
        result.current.addRecentToken(token)
      })

      const tokens = result.current.storedTokensByChain[SupportedChainId.MAINNET]
      expect(tokens).toHaveLength(2)
      expect(tokens[0].address).toBe(ADDRESS_2.toLowerCase())
      expect(tokens[1].address).toBe(ADDRESS_1)
    })

    it('respects maxItems limit', () => {
      const store = createStoreWithLocalStorage()
      const wrapper = createTestWrapper(store)

      const { result } = renderHook(
        () =>
          useRecentTokensStorage({
            favoriteKeys: new Set(),
            maxItems: 2,
          }),
        { wrapper },
      )

      const token1 = createTestToken(SupportedChainId.MAINNET, ADDRESS_1, 'T1')
      const token2 = createTestToken(SupportedChainId.MAINNET, ADDRESS_2, 'T2')
      const token3 = createTestToken(SupportedChainId.MAINNET, ADDRESS_3, 'T3')

      act(() => {
        result.current.addRecentToken(token1)
        result.current.addRecentToken(token2)
        result.current.addRecentToken(token3)
      })

      const tokens = result.current.storedTokensByChain[SupportedChainId.MAINNET]
      expect(tokens).toHaveLength(2)
      // Most recent should be first
      expect(tokens[0].address).toBe(ADDRESS_3.toLowerCase())
      expect(tokens[1].address).toBe(ADDRESS_2.toLowerCase())
    })

    it('adds tokens to different chains independently', () => {
      const store = createStoreWithLocalStorage()
      const wrapper = createTestWrapper(store)

      const { result } = renderHook(
        () =>
          useRecentTokensStorage({
            favoriteKeys: new Set(),
          }),
        { wrapper },
      )

      const mainnetToken = createTestToken(SupportedChainId.MAINNET, ADDRESS_1, 'MAIN')
      const gnosisToken = createTestToken(SupportedChainId.GNOSIS_CHAIN, ADDRESS_2, 'GNOSIS')

      act(() => {
        result.current.addRecentToken(mainnetToken)
        result.current.addRecentToken(gnosisToken)
      })

      expect(result.current.storedTokensByChain[SupportedChainId.MAINNET]).toHaveLength(1)
      expect(result.current.storedTokensByChain[SupportedChainId.GNOSIS_CHAIN]).toHaveLength(1)
    })
  })

  describe('clearRecentTokens', () => {
    it('clears tokens for a specific chain', () => {
      const storedData: StoredRecentTokensByChain = {
        [SupportedChainId.MAINNET]: [
          createStoredToken(SupportedChainId.MAINNET, ADDRESS_1),
          createStoredToken(SupportedChainId.MAINNET, ADDRESS_2),
        ],
        [SupportedChainId.GNOSIS_CHAIN]: [createStoredToken(SupportedChainId.GNOSIS_CHAIN, ADDRESS_3)],
      }
      setStoredTokens(storedData)
      const store = createStoreWithLocalStorage()
      const wrapper = createTestWrapper(store)

      const { result } = renderHook(
        () =>
          useRecentTokensStorage({
            favoriteKeys: new Set(),
          }),
        { wrapper },
      )

      act(() => {
        result.current.clearRecentTokens(SupportedChainId.MAINNET)
      })

      expect(result.current.storedTokensByChain[SupportedChainId.MAINNET]).toEqual([])
      // Other chain should be unaffected
      expect(result.current.storedTokensByChain[SupportedChainId.GNOSIS_CHAIN]).toHaveLength(1)
    })

    it('does nothing when chain has no tokens', () => {
      const store = createStoreWithLocalStorage()
      const wrapper = createTestWrapper(store)

      const { result } = renderHook(
        () =>
          useRecentTokensStorage({
            favoriteKeys: new Set(),
          }),
        { wrapper },
      )

      const initialState = result.current.storedTokensByChain

      act(() => {
        result.current.clearRecentTokens(SupportedChainId.MAINNET)
      })

      // State reference should be the same (no unnecessary update)
      expect(result.current.storedTokensByChain).toBe(initialState)
    })
  })
})
