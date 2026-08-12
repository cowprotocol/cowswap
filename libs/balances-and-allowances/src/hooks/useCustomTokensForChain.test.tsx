import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useUserAddedTokens, useVirtualLists } from '@cowprotocol/tokens'

import { renderHook } from '@testing-library/react'

import { useCustomTokensForChain } from './useCustomTokensForChain'

jest.mock('@cowprotocol/tokens', () => ({
  useUserAddedTokens: jest.fn(),
  useVirtualLists: jest.fn(),
}))

const useUserAddedTokensMock = jest.requireMock<{ useUserAddedTokens: jest.Mock }>(
  '@cowprotocol/tokens',
).useUserAddedTokens
const useVirtualListsMock = jest.requireMock<{ useVirtualLists: jest.Mock }>('@cowprotocol/tokens').useVirtualLists

const TOKEN_A = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const TOKEN_B = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const TOKEN_C = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const TOKEN_D = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'

type MinimalToken = { chainId: SupportedChainId; address: string }

function mockTokens(tokens: MinimalToken[]): void {
  useUserAddedTokensMock.mockReturnValue(tokens as unknown as ReturnType<typeof useUserAddedTokens>)
}

function mockVirtualLists(listsBySource: Record<string, MinimalToken[]>): void {
  const state = Object.fromEntries(
    Object.entries(listsBySource).map(([source, tokens]) => [source, { source, list: { tokens } }]),
  )

  useVirtualListsMock.mockReturnValue(state as unknown as ReturnType<typeof useVirtualLists>)
}

describe('useCustomTokensForChain', () => {
  beforeEach(() => {
    useUserAddedTokensMock.mockReset()
    useVirtualListsMock.mockReset()
    mockVirtualLists({})
  })

  it('returns an empty array when no user-added tokens exist', () => {
    mockTokens([])

    const { result } = renderHook(() => useCustomTokensForChain(SupportedChainId.MAINNET))

    expect(result.current).toEqual([])
  })

  it('filters tokens by chainId', () => {
    mockTokens([
      { chainId: SupportedChainId.MAINNET, address: TOKEN_A },
      { chainId: SupportedChainId.ARBITRUM_ONE, address: TOKEN_B },
      { chainId: SupportedChainId.MAINNET, address: TOKEN_C },
    ])

    const { result } = renderHook(() => useCustomTokensForChain(SupportedChainId.MAINNET))

    expect(result.current).toEqual([getAddressKey(TOKEN_A), getAddressKey(TOKEN_C)])
  })

  it('normalizes addresses via getAddressKey', () => {
    mockTokens([{ chainId: SupportedChainId.MAINNET, address: TOKEN_A }])

    const { result } = renderHook(() => useCustomTokensForChain(SupportedChainId.MAINNET))

    expect(result.current).toEqual([getAddressKey(TOKEN_A)])
  })

  it('includes tokens from widget virtual lists (e.g. widgetCustomTokens)', () => {
    mockTokens([])
    mockVirtualLists({
      widgetCustomTokens: [
        { chainId: SupportedChainId.MAINNET, address: TOKEN_B },
        { chainId: SupportedChainId.ARBITRUM_ONE, address: TOKEN_C },
      ],
    })

    const { result } = renderHook(() => useCustomTokensForChain(SupportedChainId.MAINNET))

    expect(result.current).toEqual([getAddressKey(TOKEN_B)])
  })

  it('merges and dedupes user-added and virtual list tokens', () => {
    mockTokens([{ chainId: SupportedChainId.MAINNET, address: TOKEN_A }])
    mockVirtualLists({
      widgetCustomTokens: [
        { chainId: SupportedChainId.MAINNET, address: TOKEN_A },
        { chainId: SupportedChainId.MAINNET, address: TOKEN_D },
      ],
    })

    const { result } = renderHook(() => useCustomTokensForChain(SupportedChainId.MAINNET))

    expect(result.current).toEqual([getAddressKey(TOKEN_A), getAddressKey(TOKEN_D)])
  })
})
