import { ReactNode } from 'react'

import { renderHook, waitFor } from '@testing-library/react'
import BigNumber from 'bignumber.js'
import { useNetworkId } from 'state/network'
import { SWRConfig } from 'swr'
import { transformTrade } from 'utils'

import { getTrades, Order, RawTrade, Trade } from 'api/operator'

import { ALL_TRADES_PAGE_SIZE, useOrderTrades } from '../../hooks/useOperatorTrades'

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

const ONE = new BigNumber(1)
const TWO = new BigNumber(2)

// Trades are deduped by where they settled, so distinct fills need distinct txHash/logIndex.
function createFill(index: number): RawTrade {
  return { txHash: `0xfill${index}`, blockNumber: 42, logIndex: index } as RawTrade
}

function createFullPage(): RawTrade[] {
  return Array.from({ length: ALL_TRADES_PAGE_SIZE }, (_, index) => createFill(index))
}

// Only the fields the hook reads: its SWR key, and the tokens it attaches to each trade.
function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    uid: '0xorder',
    buyToken: null,
    sellToken: null,
    executedBuyAmount: ONE,
    executedSellAmount: ONE,
    ...overrides,
  } as Order
}

// Trades are cached by order, so without a fresh cache one test's trades satisfy another's key.
function FreshSwrCache({ children }: { children: ReactNode }): ReactNode {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
}

// Serves `fills` as a single short page, which ends the paging.
function serveFills(fills: RawTrade[]): void {
  mockedGetTrades.mockImplementation(async ({ offset = 0 }) => fills.slice(offset))
}

beforeEach(() => {
  mockedUseNetworkId.mockReset()
  mockedGetTrades.mockReset()
  mockedTransformTrade.mockReset()

  mockedUseNetworkId.mockReturnValue(1)
  mockedTransformTrade.mockImplementation(
    (trade) => ({ txHash: trade.txHash, executionTime: new Date('2024-01-01T00:00:00Z') }) as Trade,
  )
})

describe('useOrderTrades fills page', () => {
  it('surfaces the error and reports nothing when getTrades fails', async () => {
    mockedGetTrades.mockRejectedValue(new Error('barn/prod unavailable'))

    const { result } = renderHook(() => useOrderTrades(createMockOrder(), 0, 10), { wrapper: FreshSwrCache })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error?.message).toBe('Failed to fetch trades')
    expect(result.current.trades).toEqual([])
    // Undefined, not [] — the caller must not read this as "the order charged no fees".
    expect(result.current.protocolFees).toBeUndefined()
  })

  it('clears error and returns trades after a successful refetch', async () => {
    mockedGetTrades.mockRejectedValueOnce(new Error('temporary outage'))
    const initialOrder = createMockOrder()
    const { result, rerender } = renderHook(({ order }) => useOrderTrades(order, 0, 10), {
      initialProps: { order: initialOrder as Order | null },
      wrapper: FreshSwrCache,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error?.message).toBe('Failed to fetch trades')

    serveFills([createFill(0)])

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

  it('pages client-side, so walking the fills does not refetch them', async () => {
    serveFills([createFill(0), createFill(1), createFill(2)])
    const order = createMockOrder()

    const { result, rerender } = renderHook(({ offset }) => useOrderTrades(order, offset, 2), {
      initialProps: { offset: 0 },
      wrapper: FreshSwrCache,
    })

    await waitFor(() => expect(result.current.trades).toHaveLength(2))
    expect(result.current.hasNextPage).toBe(true)
    const callsAfterFirstPage = mockedGetTrades.mock.calls.length

    rerender({ offset: 2 })

    await waitFor(() => expect(result.current.trades).toHaveLength(1))
    expect(result.current.hasNextPage).toBe(false)
    expect(result.current.trades[0].txHash).toBe('0xfill2')
    expect(mockedGetTrades).toHaveBeenCalledTimes(callsAfterFirstPage)
  })
})

describe('useOrderTrades protocol fees', () => {
  it('does not fetch anything when given no order', () => {
    const { result } = renderHook(() => useOrderTrades(null, 0, 10), { wrapper: FreshSwrCache })

    expect(mockedGetTrades).not.toHaveBeenCalled()
    expect(result.current.protocolFees).toBeUndefined()
  })

  it('aggregates every fill, not only the ones on the current page', async () => {
    serveFills([createFill(0), createFill(1), createFill(2)])

    const { result } = renderHook(() => useOrderTrades(createMockOrder(), 0, 2), { wrapper: FreshSwrCache })

    await waitFor(() => expect(result.current.protocolFees).toHaveLength(3))
    expect(result.current.trades).toHaveLength(2)

    // The API documents a short page as the last one, so a second call would be wasted.
    expect(mockedGetTrades).toHaveBeenCalledTimes(1)
  })

  it('keeps paging while the API fills every page', async () => {
    const fills = [...createFullPage(), createFill(ALL_TRADES_PAGE_SIZE)]
    mockedGetTrades.mockImplementation(async ({ offset = 0 }) => fills.slice(offset, offset + ALL_TRADES_PAGE_SIZE))

    const { result } = renderHook(() => useOrderTrades(createMockOrder(), 0, 10), { wrapper: FreshSwrCache })

    // Stopping at the first full page would drop the last fill.
    await waitFor(() => expect(result.current.protocolFees).toHaveLength(fills.length))
    expect(mockedGetTrades).toHaveBeenLastCalledWith(expect.objectContaining({ offset: ALL_TRADES_PAGE_SIZE }))
  })

  it('stops instead of double-counting when the API ignores the offset', async () => {
    // Always the same full page: only the dedupe can end this, since no page is ever short.
    mockedGetTrades.mockResolvedValue(createFullPage())

    const { result } = renderHook(() => useOrderTrades(createMockOrder(), 0, 10), { wrapper: FreshSwrCache })

    await waitFor(() => expect(result.current.protocolFees).toHaveLength(ALL_TRADES_PAGE_SIZE))
    expect(mockedGetTrades).toHaveBeenCalledTimes(2)
  })

  it('does not report one order’s fees while another order is loading', async () => {
    serveFills([createFill(0), createFill(1)])

    const { result, rerender } = renderHook(({ order }) => useOrderTrades(order, 0, 10), {
      initialProps: { order: createMockOrder({ uid: '0xfirst' }) as Order | null },
      wrapper: FreshSwrCache,
    })

    await waitFor(() => expect(result.current.protocolFees).toHaveLength(2))

    // Hold the second order's only page open: its fees are unknown, not the first order's.
    let resolveSecond: (trades: RawTrade[]) => void = () => undefined
    mockedGetTrades.mockImplementationOnce(() => new Promise((resolve) => (resolveSecond = resolve)))
    rerender({ order: createMockOrder({ uid: '0xsecond' }) })

    expect(result.current.protocolFees).toBeUndefined()

    resolveSecond([createFill(9)])
    await waitFor(() => expect(result.current.protocolFees).toHaveLength(1))
  })
})
