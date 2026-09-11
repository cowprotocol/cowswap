import type { PropsWithChildren, ReactElement } from 'react'

import { OrderClass, OrderKind, SigningScheme, SupportedChainId, type UID } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'
import type { QueryPage, TwapPartOrder, TwapPartOrderStatus } from '@cowprotocol/sdk-composable'

import { act, renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'

import { OrderStatus, type Order } from 'legacy/state/orders/actions'

import { ORDERS_TABLE_PAGE_SIZE } from 'modules/ordersTable'

import { parseOrder } from 'utils/orderUtils/parseOrder'

import { useEoaTwapPartOrders } from './useEoaTwapPartOrders'

import { programmaticOrdersApi } from '../services/programmaticOrdersApi'
import { TwapOrderStatus, type TwapOrderItem } from '../types'
import { emulatePartAsOrder } from '../utils/emulatePartAsOrder'

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

function makePartPage(uid: string, status: TwapPartOrderStatus = 'fulfilled'): QueryPage<TwapPartOrder> {
  const executedSellAmount = status === 'fulfilled' ? 10n : 0n

  return {
    totalCount: 1,
    items: [
      {
        orderUid: uid,
        status,
        sellAmount: 10n,
        buyAmount: 5n,
        feeAmount: 0n,
        validTo: 2_000_000_000,
        createdAt: 1_000_000_000,
        executedSellAmount,
        executedBuyAmount: status === 'fulfilled' ? 6n : 0n,
        executedFeeAmount: status === 'fulfilled' ? 1n : 0n,
      },
    ],
  }
}

function makeTwapOrder(partOrdersCount = 1, updatedAtBlock = '1'): TwapOrderItem {
  return {
    id: 'event',
    hash: 'hash',
    chainId: SupportedChainId.GNOSIS_CHAIN,
    safeAddress: parent.owner,
    resolvedOwner: owner,
    status: TwapOrderStatus.Pending,
    submissionDate: new Date(0).toISOString(),
    partOrdersCount,
    updatedAtBlock,
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

  it.each([
    ['unconfirmed', 0, 1_999_999_941],
    ['fulfilled', 0, 1_999_999_941],
    ['unconfirmed', 20, 1_999_999_981],
    ['fulfilled', 20, 1_999_999_981],
  ] as const)('uses the part start for %s parts with span %s', async (status, span, startTime) => {
    fetchEoaTwapPartOrdersMock.mockResolvedValue(makePartPage('part', status))
    const twapOrder = makeTwapOrder()
    twapOrder.order.span = span
    const { result } = renderHook(() => useEoaTwapPartOrders(twapOrder, parent, 1, true), {
      wrapper: SwrTestProvider,
    })
    await waitFor(() => expect(result.current.orders).toHaveLength(1))
    const expectedStart = new Date(startTime * 1000)
    expect(result.current.orders[0]?.creationTime).toEqual(expectedStart)

    const safePart = emulatePartAsOrder(
      {
        uid: 'part',
        index: 0,
        chainId: twapOrder.chainId,
        safeAddress: owner,
        twapOrderId: twapOrder.id,
        isCreatedInOrderBook: false,
        isCancelling: false,
        order: {
          sellToken: inputToken.address,
          buyToken: outputToken.address,
          receiver: owner,
          sellAmount: '10',
          buyAmount: '5',
          validTo: 2_000_000_000,
          appData: twapOrder.order.appData,
          feeAmount: '0',
          kind: OrderKind.SELL,
          partiallyFillable: false,
          signingScheme: SigningScheme.EIP1271,
          signature: '',
        },
      },
      twapOrder,
    )
    expect(safePart.creationDate).toBe(expectedStart.toISOString())
  })

  it('falls back to the record timestamp when the part expiry is unavailable', async () => {
    const page = makePartPage('part')
    page.items[0].validTo = null
    fetchEoaTwapPartOrdersMock.mockResolvedValue(page)
    const { result } = renderHook(() => useEoaTwapPartOrders(makeTwapOrder(), parent, 1, true), {
      wrapper: SwrTestProvider,
    })
    await waitFor(() => expect(result.current.orders).toHaveLength(1))
    expect(result.current.orders[0]?.creationTime).toEqual(new Date(1_000_000_000_000))
  })

  it('loads candidate-only parents and promotes the same row without changing the count', async () => {
    const page = makePartPage('candidate')
    const candidate = {
      ...page.items[0],
      status: 'unconfirmed',
      executedSellAmount: null,
      executedBuyAmount: null,
      executedFeeAmount: null,
    } as TwapPartOrder
    fetchEoaTwapPartOrdersMock
      .mockResolvedValueOnce({ totalCount: 1, items: [candidate] })
      .mockResolvedValueOnce({ totalCount: 1, items: [{ ...candidate, status: 'open' }] })
    const { result, rerender } = renderHook(({ order }) => useEoaTwapPartOrders(order, parent, 1, true), {
      initialProps: { order: makeTwapOrder(1, '1') },
      wrapper: SwrTestProvider,
    })

    await waitFor(() => expect(result.current.orders[0]?.status).toBe(OrderStatus.SCHEDULED))
    expect(result.current.orders[0]?.composableCowInfo?.isVirtualPart).toBe(true)

    rerender({ order: makeTwapOrder(1, '2') })

    await waitFor(() => expect(result.current.orders[0]?.status).toBe(OrderStatus.PENDING))
    expect(result.current.orders[0]?.id).toBe('candidate')
    expect(result.current.orders[0]?.composableCowInfo?.isVirtualPart).toBe(false)
    expect(fetchEoaTwapPartOrdersMock).toHaveBeenCalledTimes(2)
  })

  it.each([
    [TwapOrderStatus.Cancelled, OrderStatus.CANCELLED],
    [TwapOrderStatus.Expired, OrderStatus.EXPIRED],
  ])('does not show candidates as scheduled under a %s parent', async (status, expected) => {
    const page = makePartPage('candidate')
    fetchEoaTwapPartOrdersMock.mockResolvedValue({
      ...page,
      items: page.items.map((part) => ({
        ...part,
        status: 'unconfirmed',
        executedSellAmount: null,
        executedBuyAmount: null,
        executedFeeAmount: null,
      })),
    })
    const { result } = renderHook(() => useEoaTwapPartOrders({ ...makeTwapOrder(), status }, parent, 1, true), {
      wrapper: SwrTestProvider,
    })
    await waitFor(() => expect(result.current.orders[0]?.status).toBe(expected))
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
    expect(result.current.orders[0]?.composableCowInfo).toMatchObject({
      parentId: 'event',
      twapOrderHash: 'hash',
    })

    rerender({ parentOrder: { ...parent }, twapOrder })
    expect(fetchEoaTwapPartOrdersMock).toHaveBeenCalledTimes(1)

    rerender({ parentOrder: parent, twapOrder: makeTwapOrder(2) })
    await waitFor(() => expect(result.current.orders[0]?.id).toBe('part-2'))
    expect(fetchEoaTwapPartOrdersMock).toHaveBeenCalledTimes(2)
  })

  it('requests the selected server page and marks its final part using the unified count', async () => {
    fetchEoaTwapPartOrdersMock.mockResolvedValue({ ...makePartPage('last'), totalCount: 11 })
    const { result } = renderHook(() => useEoaTwapPartOrders(makeTwapOrder(11), parent, 2, true), {
      wrapper: SwrTestProvider,
    })
    await waitFor(() => expect(result.current.orders[0]?.id).toBe('last'))
    expect(fetchEoaTwapPartOrdersMock).toHaveBeenCalledWith('event', SupportedChainId.GNOSIS_CHAIN, 2, 10)
    expect(result.current.orders[0]?.composableCowInfo?.isTheLastPart).toBe(true)
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

  it('refreshes an expanded part page when the parent cursor changes', async () => {
    fetchEoaTwapPartOrdersMock
      .mockResolvedValueOnce(makePartPage('stale-part'))
      .mockResolvedValueOnce(makePartPage('updated-part'))
    const { result, rerender } = renderHook(({ twapOrder }) => useEoaTwapPartOrders(twapOrder, parent, 1, true), {
      initialProps: { twapOrder: makeTwapOrder() },
      wrapper: SwrTestProvider,
    })

    await waitFor(() => expect(result.current.orders[0]?.id).toBe('stale-part'))

    rerender({ twapOrder: makeTwapOrder(1, '2') })

    await waitFor(() => expect(result.current.orders[0]?.id).toBe('updated-part'))
    expect(fetchEoaTwapPartOrdersMock).toHaveBeenCalledTimes(2)
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

  it('shows an open part as cancelled when its parent is cancelled', async () => {
    fetchEoaTwapPartOrdersMock.mockResolvedValue(makePartPage('open-part', 'open'))

    const { result } = renderHook(
      () => useEoaTwapPartOrders({ ...makeTwapOrder(), status: TwapOrderStatus.Cancelled }, parent, 1, true),
      { wrapper: SwrTestProvider },
    )

    await waitFor(() => expect(result.current.orders[0]?.status).toBe(OrderStatus.CANCELLED))
  })
})
