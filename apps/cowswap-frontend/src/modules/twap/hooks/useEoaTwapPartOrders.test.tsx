import type { PropsWithChildren, ReactElement } from 'react'

import { OrderClass, OrderKind, SigningScheme, SupportedChainId, type UID } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'
import type { QueryPage, TwapPartOrder } from '@cowprotocol/sdk-composable'

import { act, renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'

import { OrderStatus, type Order } from 'legacy/state/orders/actions'

import { ORDERS_TABLE_PAGE_SIZE } from 'modules/ordersTable'

import { parseOrder } from 'utils/orderUtils/parseOrder'

import { useEoaTwapPartOrders } from './useEoaTwapPartOrders'

import { programmaticOrdersApi } from '../services/programmaticOrdersApi'
import { TwapOrderStatus, type TwapOrderItem } from '../types'

jest.mock('modules/ordersTable', () => ({ ORDERS_TABLE_PAGE_SIZE: 10 }))
jest.mock('../services/programmaticOrdersApi', () => ({
  ...jest.requireActual('../services/programmaticOrdersApi'),
  programmaticOrdersApi: { fetchEoaTwapPartOrders: jest.fn() },
}))

const fetchEoaTwapPartOrdersMock = programmaticOrdersApi.fetchEoaTwapPartOrders as jest.MockedFunction<
  typeof programmaticOrdersApi.fetchEoaTwapPartOrders
>
const owner = '0x1111111111111111111111111111111111111111'
const inputToken = new Token(SupportedChainId.GNOSIS_CHAIN, '0x2222222222222222222222222222222222222222', 18)
const outputToken = new Token(SupportedChainId.GNOSIS_CHAIN, '0x3333333333333333333333333333333333333333', 18)
const parent = parseOrder({
  id: 'parent' as UID,
  owner,
  sellToken: inputToken.address,
  buyToken: outputToken.address,
  receiver: owner,
  sellAmount: '10',
  buyAmount: '5',
  validTo: 2_000_000_000,
  appData: `0x${'00'.repeat(32)}`,
  feeAmount: '0',
  kind: OrderKind.SELL,
  partiallyFillable: true,
  signature: '',
  signingScheme: SigningScheme.EIP1271,
  class: OrderClass.LIMIT,
  status: OrderStatus.PENDING,
  creationTime: new Date(0).toISOString(),
  sellAmountBeforeFee: '10',
  inputToken,
  outputToken,
} satisfies Order)

function makePartPage(uid: string): QueryPage<TwapPartOrder> {
  return {
    totalCount: 1,
    items: [
      {
        orderUid: uid,
        status: 'fulfilled',
        sellAmount: 10n,
        buyAmount: 5n,
        feeAmount: 0n,
        validTo: 2_000_000_000,
        createdAt: 1_000_000_000,
        executedSellAmount: 10n,
        executedBuyAmount: 6n,
        executedFeeAmount: 1n,
      },
    ],
  }
}

function makeTwapOrder(partOrdersCount = 1): TwapOrderItem {
  return {
    id: 'event',
    hash: 'hash',
    chainId: SupportedChainId.GNOSIS_CHAIN,
    safeAddress: parent.owner,
    resolvedOwner: owner,
    status: TwapOrderStatus.Pending,
    submissionDate: new Date(0).toISOString(),
    partOrdersCount,
    order: {
      sellToken: parent.inputToken.address,
      buyToken: parent.outputToken.address,
      receiver: parent.owner,
      partSellAmount: '10',
      minPartLimit: '5',
      t0: 0,
      n: 1,
      t: 60,
      span: 0,
      appData: `0x${'00'.repeat(32)}`,
    },
    executionInfo: {
      confirmedPartsCount: 0,
      info: { executedSellAmount: '0', executedBuyAmount: '0', executedFeeAmount: '0' },
    },
  }
}

function SwrTestProvider({ children }: PropsWithChildren): ReactElement {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
}

describe('useEoaTwapPartOrders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('remaps parent snapshots and refetches when the part count changes', async () => {
    fetchEoaTwapPartOrdersMock
      .mockResolvedValueOnce(makePartPage('part-1'))
      .mockResolvedValueOnce(makePartPage('part-2'))
    const twapOrder = makeTwapOrder()
    const { result, rerender } = renderHook(
      ({ parentOrder, twapOrder }) => useEoaTwapPartOrders(twapOrder, parentOrder, 1, true),
      { initialProps: { parentOrder: parent, twapOrder }, wrapper: SwrTestProvider },
    )

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.orders[0]?.id).toBe('part-1'))
    expect(fetchEoaTwapPartOrdersMock).toHaveBeenCalledWith(
      'event',
      SupportedChainId.GNOSIS_CHAIN,
      1,
      ORDERS_TABLE_PAGE_SIZE,
    )

    rerender({ parentOrder: { ...parent }, twapOrder })
    expect(fetchEoaTwapPartOrdersMock).toHaveBeenCalledTimes(1)

    rerender({ parentOrder: parent, twapOrder: makeTwapOrder(2) })
    await waitFor(() => expect(result.current.orders[0]?.id).toBe('part-2'))
    expect(fetchEoaTwapPartOrdersMock).toHaveBeenCalledTimes(2)
  })

  it('ignores stale responses and clears row failures', async () => {
    let resolveStale: ((page: QueryPage<TwapPartOrder>) => void) | undefined
    fetchEoaTwapPartOrdersMock
      .mockImplementationOnce(() => new Promise((resolve) => (resolveStale = resolve)))
      .mockResolvedValueOnce(makePartPage('current'))
      .mockRejectedValueOnce(new Error('Unavailable'))
    const { result, rerender } = renderHook(({ twapOrder }) => useEoaTwapPartOrders(twapOrder, parent, 1, true), {
      initialProps: { twapOrder: makeTwapOrder() },
      wrapper: SwrTestProvider,
    })

    rerender({ twapOrder: makeTwapOrder(2) })
    await waitFor(() => expect(result.current.orders[0]?.id).toBe('current'))

    act(() => resolveStale?.(makePartPage('stale')))
    expect(result.current.orders[0]?.id).toBe('current')

    rerender({ twapOrder: makeTwapOrder(3) })
    await waitFor(() => expect(result.current).toEqual({ orders: [], isLoading: false }))
  })

  it('does not request zero-part parents and clears a loaded page when the count becomes zero', async () => {
    fetchEoaTwapPartOrdersMock.mockResolvedValue(makePartPage('part'))
    const { result, rerender } = renderHook(({ twapOrder }) => useEoaTwapPartOrders(twapOrder, parent, 1, true), {
      initialProps: { twapOrder: makeTwapOrder() },
      wrapper: SwrTestProvider,
    })

    await waitFor(() => expect(result.current.orders).toHaveLength(1))

    rerender({ twapOrder: makeTwapOrder(0) })
    await waitFor(() => expect(result.current.orders).toEqual([]))

    expect(result.current).toEqual({ orders: [], isLoading: false })
    expect(fetchEoaTwapPartOrdersMock).toHaveBeenCalledTimes(1)
  })

  it('refreshes an expanded part page', async () => {
    jest.useFakeTimers()
    fetchEoaTwapPartOrdersMock
      .mockResolvedValueOnce(makePartPage('stale-part'))
      .mockResolvedValueOnce(makePartPage('updated-part'))

    try {
      const { result } = renderHook(() => useEoaTwapPartOrders(makeTwapOrder(), parent, 1, true), {
        wrapper: SwrTestProvider,
      })

      await act(async () => {
        await jest.advanceTimersByTimeAsync(0)
      })
      expect(result.current.orders[0]?.id).toBe('stale-part')

      await act(async () => {
        await jest.advanceTimersByTimeAsync(30_000)
      })
      expect(result.current.orders[0]?.id).toBe('updated-part')
      expect(fetchEoaTwapPartOrdersMock).toHaveBeenCalledTimes(2)
    } finally {
      jest.useRealTimers()
    }
  })

  it('refreshes parts when the parent status changes', async () => {
    fetchEoaTwapPartOrdersMock
      .mockResolvedValueOnce(makePartPage('pending-parent-part'))
      .mockResolvedValueOnce(makePartPage('fulfilled-parent-part'))
    const twapOrder = makeTwapOrder()
    const { result, rerender } = renderHook(({ order }) => useEoaTwapPartOrders(order, parent, 1, true), {
      initialProps: { order: twapOrder },
      wrapper: SwrTestProvider,
    })

    await waitFor(() => expect(result.current.orders[0]?.id).toBe('pending-parent-part'))

    rerender({ order: { ...twapOrder, status: TwapOrderStatus.Fulfilled } })

    await waitFor(() => expect(result.current.orders[0]?.id).toBe('fulfilled-parent-part'))
    expect(fetchEoaTwapPartOrdersMock).toHaveBeenCalledTimes(2)
  })
})
