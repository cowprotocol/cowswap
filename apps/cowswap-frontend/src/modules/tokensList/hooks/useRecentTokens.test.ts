import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, renderHook } from '@testing-library/react'

import { useRecentTokens } from './useRecentTokens'

import { RECENT_TOKENS_STORAGE_KEY, StoredRecentToken } from '../utils/recentTokensStorage'

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

describe('useRecentTokens', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty array when no stored tokens', () => {
    const { result } = renderHook(() =>
      useRecentTokens({
        allTokens: [],
        favoriteTokens: [],
        activeChainId: SupportedChainId.MAINNET,
      }),
    )

    expect(result.current.recentTokens).toEqual([])
  })

  it('returns recent tokens for the active chain', () => {
    const token = createTestToken(SupportedChainId.MAINNET, ADDRESS_1, 'TKN')

    setStoredTokens({
      [SupportedChainId.MAINNET]: [createStoredToken(SupportedChainId.MAINNET, ADDRESS_1, 'TKN')],
    })

    const { result } = renderHook(() =>
      useRecentTokens({
        allTokens: [token],
        favoriteTokens: [],
        activeChainId: SupportedChainId.MAINNET,
      }),
    )

    expect(result.current.recentTokens).toHaveLength(1)
    expect(result.current.recentTokens[0].symbol).toBe('TKN')
  })

  it('does not return tokens from other chains', () => {
    setStoredTokens({
      [SupportedChainId.GNOSIS_CHAIN]: [createStoredToken(SupportedChainId.GNOSIS_CHAIN, ADDRESS_1, 'TKN')],
    })

    const { result } = renderHook(() =>
      useRecentTokens({
        allTokens: [],
        favoriteTokens: [],
        activeChainId: SupportedChainId.MAINNET,
      }),
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

    const { result } = renderHook(() =>
      useRecentTokens({
        allTokens: [favoriteToken, regularToken],
        favoriteTokens: [favoriteToken],
        activeChainId: SupportedChainId.MAINNET,
      }),
    )

    expect(result.current.recentTokens).toHaveLength(1)
    expect(result.current.recentTokens[0].address.toLowerCase()).toBe(ADDRESS_2)
  })

  it('addRecentToken adds a token to the list', () => {
    const token = createTestToken(SupportedChainId.MAINNET, ADDRESS_1, 'NEW')

    const { result } = renderHook(() =>
      useRecentTokens({
        allTokens: [token],
        favoriteTokens: [],
        activeChainId: SupportedChainId.MAINNET,
      }),
    )

    expect(result.current.recentTokens).toHaveLength(0)

    act(() => {
      result.current.addRecentToken(token)
    })

    expect(result.current.recentTokens).toHaveLength(1)
    expect(result.current.recentTokens[0].symbol).toBe('NEW')
  })

  it('addRecentToken does not add favorite tokens', () => {
    const favoriteToken = createTestToken(SupportedChainId.MAINNET, ADDRESS_1, 'FAV')

    const { result } = renderHook(() =>
      useRecentTokens({
        allTokens: [favoriteToken],
        favoriteTokens: [favoriteToken],
        activeChainId: SupportedChainId.MAINNET,
      }),
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

    const { result } = renderHook(() =>
      useRecentTokens({
        allTokens: [token],
        favoriteTokens: [],
        activeChainId: SupportedChainId.MAINNET,
      }),
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

    const tokens = [
      createTestToken(SupportedChainId.MAINNET, ADDRESS_1, 'T1'),
      createTestToken(SupportedChainId.MAINNET, ADDRESS_2, 'T2'),
      createTestToken(SupportedChainId.MAINNET, ADDRESS_3, 'T3'),
    ]

    const { result } = renderHook(() =>
      useRecentTokens({
        allTokens: tokens,
        favoriteTokens: [],
        activeChainId: SupportedChainId.MAINNET,
        maxItems: 2,
      }),
    )

    expect(result.current.recentTokens).toHaveLength(2)
  })
})
