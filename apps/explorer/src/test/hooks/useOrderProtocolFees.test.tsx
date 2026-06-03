import { renderHook, waitFor } from '@testing-library/react'
import BigNumber from 'bignumber.js'
import { useNetworkId } from 'state/network'

import { getTrades, Order, RawTrade } from 'api/operator'

import { useOrderProtocolFees } from '../../hooks/useOperatorTrades'

jest.mock('state/network', () => ({
  useNetworkId: jest.fn(),
}))

jest.mock('api/operator', () => ({
  getTrades: jest.fn(),
}))

// The hook module imports web3 at the top level; we never exercise it here.
jest.mock('../../explorer/api', () => ({
  web3: {
    eth: {
      getBlock: jest.fn(),
    },
  },
}))

const mockedUseNetworkId = jest.mocked(useNetworkId)
const mockedGetTrades = jest.mocked(getTrades)

const ONE = new BigNumber(1)
const FEE_TOKEN = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    uid: '0xorder',
    executedBuyAmount: ONE,
    executedSellAmount: ONE,
    ...overrides,
  } as Order
}

function createRawTradeWithFee(amount: string): RawTrade {
  return {
    executedProtocolFees: [{ amount, token: FEE_TOKEN }],
  } as RawTrade
}

describe('useOrderProtocolFees', () => {
  beforeEach(() => {
    mockedUseNetworkId.mockReset()
    mockedGetTrades.mockReset()

    mockedUseNetworkId.mockReturnValue(1)
  })

  it('aggregates protocol fees across every fill, even with more fills than a single page', async () => {
    // 25 fills, each charging a distinct protocol fee. More than RESULTS_PER_PAGE (10).
    const allTrades = Array.from({ length: 25 }, (_, i) => createRawTradeWithFee(String(i)))

    // Emulate an API that serves at most 10 trades per page regardless of the requested limit.
    // This exercises the hook's paging loop and proves it advances by the records actually returned.
    const SERVER_PAGE_SIZE = 10
    mockedGetTrades.mockImplementation(async ({ offset = 0 }) => allTrades.slice(offset, offset + SERVER_PAGE_SIZE))

    const { result } = renderHook(() => useOrderProtocolFees(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // All 25 fills are included, not just the first page.
    expect(result.current.protocolFees).toHaveLength(25)
    expect(result.current.protocolFees.map((fee) => fee.amount.toString())).toEqual(allTrades.map((_, i) => String(i)))
    expect(result.current.error).toBeUndefined()

    // It paged through the whole order rather than fetching a single table page:
    // non-empty pages at offsets 0, 10, 20 (10 + 10 + 5 trades), then a final empty page at 25.
    expect(mockedGetTrades).toHaveBeenCalledTimes(4)
    expect(mockedGetTrades).toHaveBeenLastCalledWith(expect.objectContaining({ offset: 25 }))
  })

  it('returns the protocol fees for an order with a single fill', async () => {
    mockedGetTrades.mockResolvedValueOnce([createRawTradeWithFee('100')]).mockResolvedValueOnce([])

    const { result } = renderHook(() => useOrderProtocolFees(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.protocolFees).toHaveLength(1)
    expect(result.current.protocolFees[0].amount.toString()).toBe('100')
  })

  it('surfaces an error and returns no protocol fees when fetching trades fails', async () => {
    mockedGetTrades.mockRejectedValueOnce(new Error('barn/prod unavailable'))

    const { result } = renderHook(() => useOrderProtocolFees(createMockOrder()))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error?.message).toBe('Failed to fetch trades')
    expect(result.current.protocolFees).toEqual([])
  })
})
