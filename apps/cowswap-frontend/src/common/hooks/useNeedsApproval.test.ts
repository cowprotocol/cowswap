import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { renderHook } from '@testing-library/react'
import { SWRResponse } from 'swr'

import { useNeedsApproval } from './useNeedsApproval'
import { useTokenAllowance } from './useTokenAllowance'

jest.mock('@cowprotocol/balances-and-allowances', () => ({
  useTradeSpenderAddress: jest.fn(),
}))

jest.mock('./useTokenAllowance', () => ({
  useTokenAllowance: jest.fn(),
}))

const mockUseTradeSpenderAddress = useTradeSpenderAddress as jest.MockedFunction<typeof useTradeSpenderAddress>
const mockUseTokenAllowance = useTokenAllowance as jest.MockedFunction<typeof useTokenAllowance>

describe('useNeedsApproval', () => {
  const spender = '0x0000000000000000000000000000000000000001'
  const token = new Token(1, '0x1234567890123456789012345678901234567890', 18, 'TEST', 'Test Token')
  const amount = CurrencyAmount.fromRawAmount(token, '100')

  function mockAllowance(data: bigint | undefined): void {
    mockUseTokenAllowance.mockReturnValue({ data } as SWRResponse<bigint | undefined>)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTradeSpenderAddress.mockReturnValue(spender)
    mockAllowance(0n)
  })

  it('returns false when amount is missing', () => {
    const { result } = renderHook(() => useNeedsApproval(null))

    expect(result.current).toBe(false)
  })

  it('returns false when spender is missing', () => {
    mockUseTradeSpenderAddress.mockReturnValue(undefined)

    const { result } = renderHook(() => useNeedsApproval(amount))

    expect(result.current).toBe(false)
  })

  it('returns true when allowance is not loaded yet', () => {
    mockAllowance(undefined)

    const { result } = renderHook(() => useNeedsApproval(amount))

    expect(result.current).toBe(true)
  })

  it('returns true when allowance is insufficient', () => {
    mockAllowance(99n)

    const { result } = renderHook(() => useNeedsApproval(amount))

    expect(result.current).toBe(true)
  })

  it('returns false when allowance is sufficient', () => {
    mockAllowance(100n)

    const { result } = renderHook(() => useNeedsApproval(amount))

    expect(result.current).toBe(false)
  })
})
