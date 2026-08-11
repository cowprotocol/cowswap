import { ReactNode } from 'react'

import { renderHook, waitFor } from '@testing-library/react'
import BigNumber from 'bignumber.js'
import { useNetworkId } from 'state/network'
import { SWRConfig } from 'swr'
import { transformTrade } from 'utils'

import { getTrades, Order, RawTrade, Trade } from 'api/operator'

import { useOrderProtocolFees, useOrderTrades } from '../../hooks/useOperatorTrades'

jest.mock('state/network', () => ({
  useNetworkId: jest.fn(),
}))

jest.mock('api/operator', () => ({
  getTrades: jest.fn(),
}))

// getProtocolFees has its own unit test; a pass-through keeps these assertions about the paging.
jest.mock('utils', () => ({
  transformTrade: jest.fn(),
  getProtocolFees: jest.fn((trades) => trades),
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

// Trades are deduped by where they settled, so distinct fills need distinct txHash/logIndex.
function createFill(index: number): RawTrade {
  return createRawTrade({ txHash: `0xfill${index}`, logIndex: index })
}

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

// Fees are cached by order, so without a fresh cache one test's fees satisfy another's key.
function FreshSwrCache({ children }: { children: ReactNode }): ReactNode {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
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

describe('useOrderProtocolFees', () => {
  beforeEach(() => {
    mockedUseNetworkId.mockReset()
    mockedGetTrades.mockReset()

    mockedUseNetworkId.mockReturnValue(1)
  })

  it('does not fetch anything when given no order', async () => {
    const { result } = renderHook(() => useOrderProtocolFees(null), { wrapper: FreshSwrCache })

    expect(mockedGetTrades).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.protocolFees).toBeUndefined()
  })

  it('pages until the API runs out of trades, even when it serves shorter pages than requested', async () => {
    const fills = [createFill(0), createFill(1), createFill(2)]
    // A server capping pages below the requested size: stopping on a short page would drop the third fill.
    mockedGetTrades.mockImplementation(async ({ offset = 0 }) => fills.slice(offset, offset + 2))

    const { result } = renderHook(() => useOrderProtocolFees(createMockOrder()), { wrapper: FreshSwrCache })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.protocolFees).toHaveLength(3)
    expect(mockedGetTrades).toHaveBeenLastCalledWith(expect.objectContaining({ offset: 3 }))
  })

  it('stops instead of double-counting when the API ignores the offset', async () => {
    // Always the same fill: without dedupe this accumulates one copy per page and inflates the total.
    mockedGetTrades.mockResolvedValue([createFill(0)])

    const { result } = renderHook(() => useOrderProtocolFees(createMockOrder()), { wrapper: FreshSwrCache })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.protocolFees).toHaveLength(1)
    expect(mockedGetTrades).toHaveBeenCalledTimes(2)
    expect(result.current.error).toBeUndefined()
  })

  it('reports no fees rather than partial ones when the fetch fails', async () => {
    mockedGetTrades.mockRejectedValueOnce(new Error('barn/prod unavailable'))

    const { result } = renderHook(() => useOrderProtocolFees(createMockOrder()), { wrapper: FreshSwrCache })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error?.message).toBe('Failed to fetch the costs and fees breakdown')
    // Undefined, not [] — the caller must not read this as "the order charged no fees".
    expect(result.current.protocolFees).toBeUndefined()
  })

  it('does not report one order’s fees while another order is loading', async () => {
    const first = createMockOrder({ uid: '0xfirst' })
    mockedGetTrades.mockResolvedValueOnce([createFill(0), createFill(1)]).mockResolvedValueOnce([])

    const { result, rerender } = renderHook(({ order }) => useOrderProtocolFees(order), {
      initialProps: { order: first as Order | null },
      wrapper: FreshSwrCache,
    })

    await waitFor(() => expect(result.current.protocolFees).toHaveLength(2))

    // Its first page is held open; the follow-up page is empty so paging ends once it resolves.
    let resolveSecond: (trades: RawTrade[]) => void = () => undefined
    const pending = new Promise<RawTrade[]>((resolve) => (resolveSecond = resolve))
    mockedGetTrades.mockImplementationOnce(() => pending).mockResolvedValue([])
    rerender({ order: createMockOrder({ uid: '0xsecond' }) })

    expect(result.current.protocolFees).toBeUndefined()
    expect(result.current.isLoading).toBe(true)

    resolveSecond([createFill(9)])
    await waitFor(() => expect(result.current.protocolFees).toHaveLength(1))
  })
})
