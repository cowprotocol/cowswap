import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useUserAddedTokens } from '@cowprotocol/tokens'

import { renderHook } from '@testing-library/react'

import { useCustomTokensForChain } from './useCustomTokensForChain'

jest.mock('@cowprotocol/tokens', () => ({
  useUserAddedTokens: jest.fn(),
}))

const useUserAddedTokensMock = jest.requireMock<{ useUserAddedTokens: jest.Mock }>(
  '@cowprotocol/tokens',
).useUserAddedTokens

const TOKEN_A = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const TOKEN_B = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const TOKEN_C = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

type MinimalToken = { chainId: SupportedChainId; address: string }

function mockTokens(tokens: MinimalToken[]): void {
  useUserAddedTokensMock.mockReturnValue(tokens as unknown as ReturnType<typeof useUserAddedTokens>)
}

describe('useCustomTokensForChain', () => {
  beforeEach(() => {
    useUserAddedTokensMock.mockReset()
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

    expect(result.current).toEqual([getAddressKey(TOKEN_A), getAddressKey(TOKEN_C)].sort())
  })

  it('normalizes addresses via getAddressKey', () => {
    mockTokens([{ chainId: SupportedChainId.MAINNET, address: TOKEN_A }])

    const { result } = renderHook(() => useCustomTokensForChain(SupportedChainId.MAINNET))

    expect(result.current).toEqual([getAddressKey(TOKEN_A)])
  })

  it('returns the addresses sorted', () => {
    mockTokens([
      { chainId: SupportedChainId.MAINNET, address: TOKEN_C },
      { chainId: SupportedChainId.MAINNET, address: TOKEN_A },
      { chainId: SupportedChainId.MAINNET, address: TOKEN_B },
    ])

    const { result } = renderHook(() => useCustomTokensForChain(SupportedChainId.MAINNET))

    const expected = [TOKEN_A, TOKEN_B, TOKEN_C].map(getAddressKey).sort()
    expect(result.current).toEqual(expected)
  })

  it('preserves array identity across renders when the resulting set is equal', () => {
    mockTokens([{ chainId: SupportedChainId.MAINNET, address: TOKEN_A }])

    const { result, rerender } = renderHook(() => useCustomTokensForChain(SupportedChainId.MAINNET))
    const first = result.current

    // Different array reference, same content.
    mockTokens([{ chainId: SupportedChainId.MAINNET, address: TOKEN_A }])
    rerender()

    expect(result.current).toBe(first)
  })

  it('emits a new array identity when the set of addresses changes', () => {
    mockTokens([{ chainId: SupportedChainId.MAINNET, address: TOKEN_A }])

    const { result, rerender } = renderHook(() => useCustomTokensForChain(SupportedChainId.MAINNET))
    const first = result.current

    mockTokens([
      { chainId: SupportedChainId.MAINNET, address: TOKEN_A },
      { chainId: SupportedChainId.MAINNET, address: TOKEN_B },
    ])
    rerender()

    expect(result.current).not.toBe(first)
    expect(result.current).toEqual([getAddressKey(TOKEN_A), getAddressKey(TOKEN_B)].sort())
  })
})
