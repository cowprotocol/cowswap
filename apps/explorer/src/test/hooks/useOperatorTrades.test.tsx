import { renderHook, waitFor } from '@testing-library/react'
import BigNumber from 'bignumber.js'
import { useNetworkId } from 'state/network'
import { transformTrade } from 'utils'

import { getTrades, Order, RawTrade, Trade } from 'api/operator'

import { useOrderTrades } from '../../hooks/useOperatorTrades'

jest.mock('state/network', () => ({
  useNetworkId: jest.fn(),
}))

jest.mock('api/operator', () => ({
  getTrades: jest.fn(),
}))

jest.mock('utils', () => ({
  transformTrade: jest.fn(),
}))

jest.mock('../../explorer/api', () => ({
  web3: {
    eth: {
      getBlock: jest.fn().mockResolvedValue({ timestamp: '1715000000' }),
    },
  },
}))

const mockedUseNetworkId = jest.mocked(useNetworkId)
const mockedGetTrades = jest.mocked(getTrades)
const mockedTransformTrade = jest.mocked(transformTrade)

const ZERO = new BigNumber(0)
const ONE = new BigNumber(1)
const TWO = new BigNumber(2)

function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    uid: '0xorder',
    owner: '0x1234',
    receiver: '0x5678',
    kind: 'sell',
    partiallyFillable: false,
    signature: '0x',
    class: 'limit',
    appData: '0x',
    fullAppData: null,
    executedFeeToken: null,
    creationDate: new Date(),
    expirationDate: new Date(),
    buyTokenAddress: '0xbuy',
    buyToken: null,
    sellTokenAddress: '0xsell',
    sellToken: null,
    buyAmount: ONE,
    sellAmount: ONE,
    executedBuyAmount: ONE,
    executedSellAmount: ONE,
    feeAmount: ZERO,
    executedFeeAmount: ZERO,
    executedFee: null,
    totalFee: ZERO,
    cancelled: false,
    status: 'filled',
    partiallyFilled: false,
    fullyFilled: true,
    filledAmount: ONE,
    filledPercentage: new BigNumber(100),
    surplusAmount: ZERO,
    surplusPercentage: ZERO,
    ...overrides,
  } as Order
}

function createRawTrade(overrides: Partial<RawTrade> = {}): RawTrade {
  return {
    txHash: '0xtrade',
    blockNumber: 42,
    ...overrides,
  } as RawTrade
}

function createTransformedTrade(overrides: Partial<Trade> = {}): Trade {
  return {
    txHash: '0xtrade',
    blockNumber: 42,
    logIndex: 0,
    owner: '0x1234',
    orderId: '0xorder',
    buyAmount: ONE,
    sellAmount: ONE,
    sellAmountBeforeFees: ONE,
    buyTokenAddress: '0xbuy',
    sellTokenAddress: '0xsell',
    executionTime: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  } as Trade
}

describe('useOrderTrades', () => {
  beforeEach(() => {
    mockedUseNetworkId.mockReset()
    mockedGetTrades.mockReset()
    mockedTransformTrade.mockReset()

    mockedUseNetworkId.mockReturnValue(1)
    mockedTransformTrade.mockImplementation(() => createTransformedTrade())
  })

  it('surfaces error and returns no trades when getTrades fails', async () => {
    mockedGetTrades.mockRejectedValueOnce(new Error('barn/prod unavailable'))
    const order = createMockOrder()

    const { result } = renderHook(() => useOrderTrades(order, 0, 10))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error?.message).toBe('Failed to fetch trades')
    expect(result.current.trades).toEqual([])
  })

  it('clears error and returns trades after a successful refetch', async () => {
    mockedGetTrades.mockRejectedValueOnce(new Error('temporary outage')).mockResolvedValueOnce([createRawTrade()])
    const initialOrder = createMockOrder()
    const { result, rerender } = renderHook(({ order }) => useOrderTrades(order, 0, 10), {
      initialProps: { order: initialOrder as Order | null },
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error?.message).toBe('Failed to fetch trades')

    const refreshedOrder = createMockOrder({
      uid: initialOrder.uid,
      executedBuyAmount: TWO,
      executedSellAmount: TWO,
    })

    rerender({ order: refreshedOrder })

    await waitFor(() => {
      expect(result.current.error).toBeUndefined()
      expect(result.current.trades).toHaveLength(1)
    })
  })
})
