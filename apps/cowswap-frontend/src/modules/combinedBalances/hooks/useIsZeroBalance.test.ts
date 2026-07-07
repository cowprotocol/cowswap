import { TokenWithLogo } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'

import { useIsZeroBalance } from './useIsZeroBalance'
import { useTokensBalancesCombined } from './useTokensBalancesCombined'

jest.mock('./useTokensBalancesCombined', () => ({
  useTokensBalancesCombined: jest.fn(),
}))

const mockUseTokensBalancesCombined = useTokensBalancesCombined as jest.MockedFunction<typeof useTokensBalancesCombined>

const token = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  chainId: SupportedChainId.MAINNET,
  decimals: 6,
  symbol: 'USDC',
  name: 'USD Coin',
} as TokenWithLogo

const balanceKey = getAddressKey(getCurrencyAddress(token))

function mockBalance(raw: string | null, hasFirstLoad = true): void {
  mockUseTokensBalancesCombined.mockReturnValue({
    values: raw === null ? {} : { [balanceKey]: BigInt(raw) },
    hasFirstLoad,
  } as unknown as ReturnType<typeof useTokensBalancesCombined>)
}

describe('useIsZeroBalance()', () => {
  it('returns false when there is no currency to check', () => {
    mockBalance('0')

    const { result } = renderHook(() => useIsZeroBalance(null))

    expect(result.current).toBe(false)
  })

  it('returns true when the balance is exactly zero', () => {
    mockBalance('0')

    const { result } = renderHook(() => useIsZeroBalance(token))

    expect(result.current).toBe(true)
  })

  it('returns true when the token has no balance entry at all', () => {
    mockBalance(null)

    const { result } = renderHook(() => useIsZeroBalance(token))

    expect(result.current).toBe(true)
  })

  it('returns false before balances have loaded, even with no balance entry', () => {
    mockBalance(null, false)

    const { result } = renderHook(() => useIsZeroBalance(token))

    expect(result.current).toBe(false)
  })

  it('returns false when the balance is greater than zero (amount > balance is allowed for limit orders)', () => {
    mockBalance('1')

    const { result } = renderHook(() => useIsZeroBalance(token))

    expect(result.current).toBe(false)
  })
})
