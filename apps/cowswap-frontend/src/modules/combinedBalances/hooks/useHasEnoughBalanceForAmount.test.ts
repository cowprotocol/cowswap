import { TokenWithLogo } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { renderHook } from '@testing-library/react'

import { useHasEnoughBalanceForAmount } from './useHasEnoughBalanceForAmount'
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

function mockBalance(raw: string | null): void {
  mockUseTokensBalancesCombined.mockReturnValue({
    values: raw === null ? {} : { [balanceKey]: BigInt(raw) },
  } as unknown as ReturnType<typeof useTokensBalancesCombined>)
}

// 1 USDC and 2 USDC
const oneUsdc = CurrencyAmount.fromRawAmount(token, '1000000')
const twoUsdc = CurrencyAmount.fromRawAmount(token, '2000000')

describe('useHasEnoughBalanceForAmount()', () => {
  it('returns true when there is no amount to check', () => {
    mockBalance('0')

    const { result } = renderHook(() => useHasEnoughBalanceForAmount(null))

    expect(result.current).toBe(true)
  })

  it('returns true when the balance is greater than the amount', () => {
    mockBalance('2000000')

    const { result } = renderHook(() => useHasEnoughBalanceForAmount(oneUsdc))

    expect(result.current).toBe(true)
  })

  it('returns true when the balance equals the amount', () => {
    mockBalance('1000000')

    const { result } = renderHook(() => useHasEnoughBalanceForAmount(oneUsdc))

    expect(result.current).toBe(true)
  })

  it('returns false when the balance is less than the amount', () => {
    mockBalance('1000000')

    const { result } = renderHook(() => useHasEnoughBalanceForAmount(twoUsdc))

    expect(result.current).toBe(false)
  })
})
