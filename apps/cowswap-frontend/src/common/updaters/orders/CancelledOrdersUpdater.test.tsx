import { EnrichedOrder } from '@cowprotocol/cow-sdk'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { act, render, waitFor } from '@testing-library/react'
import { useGetSerializedBridgeOrder } from 'entities/bridgeOrders'
import { useAutoAddOrderToSurplusQueue } from 'entities/surplusModal'

import { useAllTransactions } from 'legacy/state/enhancedTransactions/hooks'
import { EnhancedTransactionDetails, HashType } from 'legacy/state/enhancedTransactions/reducer'
import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { MARKET_OPERATOR_API_POLL_INTERVAL } from 'legacy/state/orders/consts'
import { useCancelledOrders, useFulfillOrdersBatch } from 'legacy/state/orders/hooks'

import { CancelledOrdersUpdater } from './CancelledOrdersUpdater'
import { fetchAndClassifyOrder } from './utils'

jest.mock('@cowprotocol/common-const', () => ({
  CANCELLED_ORDERS_PENDING_TIME: 5 * 60 * 1000,
}))

jest.mock('@cowprotocol/wallet', () => ({
  useIsSafeWallet: jest.fn(),
  useWalletInfo: jest.fn(),
}))

jest.mock('entities/bridgeOrders', () => ({
  useGetSerializedBridgeOrder: jest.fn(),
}))

jest.mock('entities/surplusModal', () => ({
  useAutoAddOrderToSurplusQueue: jest.fn(),
}))

jest.mock('legacy/state/enhancedTransactions/hooks', () => ({
  useAllTransactions: jest.fn(),
}))

jest.mock('legacy/state/orders/hooks', () => ({
  useCancelledOrders: jest.fn(),
  useFulfillOrdersBatch: jest.fn(),
}))

jest.mock('modules/orders', () => ({
  emitFulfilledOrderEvent: jest.fn(),
}))

jest.mock('common/utils/getIsBridgeOrder', () => ({
  getIsBridgeOrder: jest.fn(() => false),
}))

jest.mock('./utils', () => ({
  fetchAndClassifyOrder: jest.fn(),
}))

const useIsSafeWalletMock = useIsSafeWallet as jest.MockedFunction<typeof useIsSafeWallet>
const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useGetSerializedBridgeOrderMock = useGetSerializedBridgeOrder as jest.MockedFunction<
  typeof useGetSerializedBridgeOrder
>
const useAutoAddOrderToSurplusQueueMock = useAutoAddOrderToSurplusQueue as jest.MockedFunction<
  typeof useAutoAddOrderToSurplusQueue
>
const useAllTransactionsMock = useAllTransactions as jest.MockedFunction<typeof useAllTransactions>
const useCancelledOrdersMock = useCancelledOrders as jest.MockedFunction<typeof useCancelledOrders>
const useFulfillOrdersBatchMock = useFulfillOrdersBatch as jest.MockedFunction<typeof useFulfillOrdersBatch>
const fetchAndClassifyOrderMock = fetchAndClassifyOrder as jest.MockedFunction<typeof fetchAndClassifyOrder>

type WalletInfo = ReturnType<typeof useWalletInfo>

function createCancelledOrder(): Order {
  return {
    id: 'order-1',
    owner: '0xabc',
    creationTime: '2024-01-01T00:00:00.000Z',
    cancellationHash: '0xcancel',
    status: OrderStatus.CANCELLED,
  } as unknown as Order
}

function createTransaction(
  hash: string,
  overrides: Partial<EnhancedTransactionDetails> = {},
): EnhancedTransactionDetails {
  return {
    hash,
    hashType: HashType.ETHEREUM_TX,
    transactionHash: hash,
    nonce: 1,
    addedTime: Date.now(),
    from: '0xabc',
    ...overrides,
  }
}

describe('CancelledOrdersUpdater', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-12T18:00:00.000Z'))

    useIsSafeWalletMock.mockReturnValue(false)
    useWalletInfoMock.mockReturnValue({
      chainId: 1,
      account: '0xabc',
    } as unknown as WalletInfo)
    useGetSerializedBridgeOrderMock.mockReturnValue(jest.fn())
    useAutoAddOrderToSurplusQueueMock.mockReturnValue(jest.fn())
    useAllTransactionsMock.mockReturnValue({
      '0xcancel': createTransaction('0xcancel', {
        confirmedTime: Date.now() - 1_000,
      }),
    })
    useCancelledOrdersMock.mockReturnValue([createCancelledOrder()])
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('rechecks recently cancelled on-chain orders using the cancellation tx time', async () => {
    const fulfillOrdersBatch = jest.fn()
    const addOrderToSurplusQueue = jest.fn()
    const fulfilledOrder = { uid: 'order-1' } as EnrichedOrder

    useFulfillOrdersBatchMock.mockReturnValue(fulfillOrdersBatch)
    useAutoAddOrderToSurplusQueueMock.mockReturnValue(addOrderToSurplusQueue)
    fetchAndClassifyOrderMock.mockResolvedValue({
      status: 'fulfilled',
      order: fulfilledOrder,
    })

    render(<CancelledOrdersUpdater />)

    await act(async () => {
      jest.advanceTimersByTime(MARKET_OPERATOR_API_POLL_INTERVAL)
    })

    await waitFor(() => {
      expect(fetchAndClassifyOrderMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'order-1' }), 1)
    })

    expect(fulfillOrdersBatch).toHaveBeenCalledWith({
      orders: [fulfilledOrder],
      chainId: 1,
      isSafeWallet: false,
    })
    expect(addOrderToSurplusQueue).toHaveBeenCalledWith('order-1')
  })

  it('does not reprocess the same recovered order on every poll when the cancelled list is stale', async () => {
    const fulfillOrdersBatch = jest.fn()
    const fulfilledOrder = { uid: 'order-1' } as EnrichedOrder

    useFulfillOrdersBatchMock.mockReturnValue(fulfillOrdersBatch)
    fetchAndClassifyOrderMock.mockResolvedValue({
      status: 'fulfilled',
      order: fulfilledOrder,
    })

    render(<CancelledOrdersUpdater />)

    await act(async () => {
      jest.advanceTimersByTime(MARKET_OPERATOR_API_POLL_INTERVAL)
    })

    await waitFor(() => {
      expect(fulfillOrdersBatch).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      jest.advanceTimersByTime(MARKET_OPERATOR_API_POLL_INTERVAL * 2)
    })

    expect(fetchAndClassifyOrderMock).toHaveBeenCalledTimes(1)
    expect(fulfillOrdersBatch).toHaveBeenCalledTimes(1)
  })

  it('follows linked replacement hashes when deriving cancellation recency', async () => {
    useAllTransactionsMock.mockReturnValue({
      '0xcancel': createTransaction('0xcancel', {
        addedTime: Date.now() - 10 * 60 * 1000,
        linkedTransactionHash: '0xcancel-speedup',
      }),
      '0xcancel-speedup': createTransaction('0xcancel-speedup', {
        addedTime: Date.now() - 1_000,
        linkedTransactionHash: '0xcancel',
        replacementType: 'speedup',
      }),
    })

    fetchAndClassifyOrderMock.mockResolvedValue(null)

    render(<CancelledOrdersUpdater />)

    await act(async () => {
      jest.advanceTimersByTime(MARKET_OPERATOR_API_POLL_INTERVAL)
    })

    await waitFor(() => {
      expect(fetchAndClassifyOrderMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'order-1' }), 1)
    })
  })

  it('follows finalized replacement cancellations after the original hash is removed', async () => {
    useAllTransactionsMock.mockReturnValue({
      '0xcancel-speedup': createTransaction('0xcancel-speedup', {
        confirmedTime: Date.now() - 1_000,
        linkedTransactionHash: '0xcancel',
        replacementType: 'speedup',
      }),
    })

    fetchAndClassifyOrderMock.mockResolvedValue(null)

    render(<CancelledOrdersUpdater />)

    await act(async () => {
      jest.advanceTimersByTime(MARKET_OPERATOR_API_POLL_INTERVAL)
    })

    await waitFor(() => {
      expect(fetchAndClassifyOrderMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'order-1' }), 1)
    })
  })
})
