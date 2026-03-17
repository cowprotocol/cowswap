import { EnrichedOrder, OrderClass } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { useGnosisSafeInfo, useWalletInfo } from '@cowprotocol/wallet'

import { act, render, waitFor } from '@testing-library/react'
import { useGetSerializedBridgeOrder } from 'entities/bridgeOrders'
import { useAutoAddOrderToSurplusQueue } from 'entities/surplusModal'
import { useDispatch } from 'react-redux'

import { useGetSafeTxInfo } from 'legacy/hooks/useGetSafeTxInfo'
import { useAllTransactions } from 'legacy/state/enhancedTransactions/hooks'
import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { MARKET_OPERATOR_API_POLL_INTERVAL, LIMIT_OPERATOR_API_POLL_INTERVAL } from 'legacy/state/orders/consts'
import {
  useAddOrUpdateOrders,
  useCancelOrdersBatch,
  useCombinedPendingOrders,
  useExpireOrdersBatch,
  useFulfillOrdersBatch,
  useInvalidateOrdersBatch,
  usePresignOrders,
  useUpdatePresignGnosisSafeTx,
} from 'legacy/state/orders/hooks'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { PendingOrdersUpdater } from './PendingOrdersUpdater'
import { fetchAndClassifyOrder } from './utils'

import { useBlockNumber } from '../../hooks/useBlockNumber'

jest.mock('@cowprotocol/common-utils', () => ({
  getExplorerOrderLink: jest.fn(() => ''),
  timeSinceInSeconds: jest.fn(() => 0),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useGnosisSafeInfo: jest.fn(),
  useWalletInfo: jest.fn(),
}))

jest.mock('appzi', () => ({
  isOrderInPendingTooLong: jest.fn(() => false),
  triggerAppziSurvey: jest.fn(),
}))

jest.mock('jotai', () => {
  const actual = jest.requireActual('jotai')

  return {
    ...actual,
    useSetAtom: jest.fn(() => jest.fn()),
  }
})

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}))

jest.mock('entities/bridgeOrders', () => ({
  useGetSerializedBridgeOrder: jest.fn(),
}))

jest.mock('entities/surplusModal', () => ({
  useAutoAddOrderToSurplusQueue: jest.fn(),
}))

jest.mock('api/cowProtocol', () => ({
  getOrder: jest.fn(),
}))

jest.mock('common/utils/getIsBridgeOrder', () => ({
  getIsBridgeOrder: jest.fn(() => false),
}))

jest.mock('legacy/hooks/useGetSafeTxInfo', () => ({
  useGetSafeTxInfo: jest.fn(),
}))

jest.mock('legacy/state/enhancedTransactions/hooks', () => ({
  useAllTransactions: jest.fn(),
}))

jest.mock('legacy/state/orders/hooks', () => ({
  useAddOrUpdateOrders: jest.fn(),
  useCancelOrdersBatch: jest.fn(),
  useCombinedPendingOrders: jest.fn(),
  useExpireOrdersBatch: jest.fn(),
  useFulfillOrdersBatch: jest.fn(),
  useInvalidateOrdersBatch: jest.fn(),
  usePresignOrders: jest.fn(),
  useUpdatePresignGnosisSafeTx: jest.fn(),
}))

jest.mock('modules/orders', () => ({
  emitCancelledOrderEvent: jest.fn(),
  emitExpiredOrderEvent: jest.fn(),
  emitFulfilledOrderEvent: jest.fn(),
  emitPresignedOrderEvent: jest.fn(),
}))

jest.mock('utils/orderUtils/getUiOrderType', () => ({
  getUiOrderType: jest.fn(),
}))

jest.mock('../../hooks/useBlockNumber', () => ({
  useBlockNumber: jest.fn(),
}))

jest.mock('./utils', () => ({
  fetchAndClassifyOrder: jest.fn(),
}))

const useGnosisSafeInfoMock = useGnosisSafeInfo as jest.MockedFunction<typeof useGnosisSafeInfo>
const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useDispatchMock = useDispatch as jest.MockedFunction<typeof useDispatch>
const useGetSerializedBridgeOrderMock = useGetSerializedBridgeOrder as jest.MockedFunction<
  typeof useGetSerializedBridgeOrder
>
const useAutoAddOrderToSurplusQueueMock = useAutoAddOrderToSurplusQueue as jest.MockedFunction<
  typeof useAutoAddOrderToSurplusQueue
>
const useGetSafeTxInfoMock = useGetSafeTxInfo as jest.MockedFunction<typeof useGetSafeTxInfo>
const useAllTransactionsMock = useAllTransactions as jest.MockedFunction<typeof useAllTransactions>
const useAddOrUpdateOrdersMock = useAddOrUpdateOrders as jest.MockedFunction<typeof useAddOrUpdateOrders>
const useCancelOrdersBatchMock = useCancelOrdersBatch as jest.MockedFunction<typeof useCancelOrdersBatch>
const useCombinedPendingOrdersMock = useCombinedPendingOrders as jest.MockedFunction<typeof useCombinedPendingOrders>
const useExpireOrdersBatchMock = useExpireOrdersBatch as jest.MockedFunction<typeof useExpireOrdersBatch>
const useFulfillOrdersBatchMock = useFulfillOrdersBatch as jest.MockedFunction<typeof useFulfillOrdersBatch>
const useInvalidateOrdersBatchMock = useInvalidateOrdersBatch as jest.MockedFunction<typeof useInvalidateOrdersBatch>
const usePresignOrdersMock = usePresignOrders as jest.MockedFunction<typeof usePresignOrders>
const useUpdatePresignGnosisSafeTxMock = useUpdatePresignGnosisSafeTx as jest.MockedFunction<
  typeof useUpdatePresignGnosisSafeTx
>
const useBlockNumberMock = useBlockNumber as jest.MockedFunction<typeof useBlockNumber>
const fetchAndClassifyOrderMock = fetchAndClassifyOrder as jest.MockedFunction<typeof fetchAndClassifyOrder>
const getUiOrderTypeMock = getUiOrderType as jest.MockedFunction<typeof getUiOrderType>

type TestOrder = Order & { uiOrderType: UiOrderType }
type WalletInfo = ReturnType<typeof useWalletInfo>

function createPendingOrder(id: string, uiOrderType: UiOrderType): TestOrder {
  return {
    id,
    owner: '0xabc',
    status: OrderStatus.PENDING,
    class: OrderClass.MARKET,
    uiOrderType,
  } as unknown as TestOrder
}

describe('PendingOrdersUpdater', () => {
  beforeEach(() => {
    jest.useFakeTimers()

    useGnosisSafeInfoMock.mockReturnValue(undefined)
    useWalletInfoMock.mockReturnValue({
      chainId: 1,
      account: '0xabc',
    } as unknown as WalletInfo)
    useDispatchMock.mockReturnValue(jest.fn())
    useGetSerializedBridgeOrderMock.mockReturnValue(jest.fn())
    useAutoAddOrderToSurplusQueueMock.mockReturnValue(jest.fn())
    useGetSafeTxInfoMock.mockReturnValue(jest.fn())
    useAllTransactionsMock.mockReturnValue({})
    useAddOrUpdateOrdersMock.mockReturnValue(jest.fn())
    useCancelOrdersBatchMock.mockReturnValue(jest.fn())
    useExpireOrdersBatchMock.mockReturnValue(jest.fn())
    useFulfillOrdersBatchMock.mockReturnValue(jest.fn())
    useInvalidateOrdersBatchMock.mockReturnValue(jest.fn())
    usePresignOrdersMock.mockReturnValue(jest.fn())
    useUpdatePresignGnosisSafeTxMock.mockReturnValue(jest.fn())
    useBlockNumberMock.mockReturnValue(123)
    fetchAndClassifyOrderMock.mockResolvedValue(null)
    getUiOrderTypeMock.mockImplementation((order) => (order as TestOrder).uiOrderType)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('polls Hooks and Yield orders on mount together with the other pending order types', async () => {
    useCombinedPendingOrdersMock.mockReturnValue([
      createPendingOrder('hooks-1', UiOrderType.HOOKS),
      createPendingOrder('yield-1', UiOrderType.YIELD),
    ])

    const setIntervalSpy = jest.spyOn(global, 'setInterval')

    const { unmount } = render(<PendingOrdersUpdater />)

    await waitFor(() => {
      expect(fetchAndClassifyOrderMock).toHaveBeenCalledTimes(2)
    })

    expect(fetchAndClassifyOrderMock.mock.calls.map(([order]) => (order as TestOrder).id).sort()).toEqual([
      'hooks-1',
      'yield-1',
    ])

    const intervalDelays = setIntervalSpy.mock.calls.map(([, delay]) => delay)

    expect(setIntervalSpy).toHaveBeenCalledTimes(Object.values(UiOrderType).length)
    expect(intervalDelays.filter((delay) => delay === MARKET_OPERATOR_API_POLL_INTERVAL)).toHaveLength(1)
    expect(intervalDelays.filter((delay) => delay === LIMIT_OPERATOR_API_POLL_INTERVAL)).toHaveLength(
      Object.values(UiOrderType).length - 1,
    )

    unmount()
    setIntervalSpy.mockRestore()
  })

  it('does not reprocess the same cancelled pending order on every poll when the pending list is stale', async () => {
    const pendingOrder = createPendingOrder('swap-1', UiOrderType.SWAP)
    const cancelOrdersBatch = jest.fn()

    useCombinedPendingOrdersMock.mockReturnValue([pendingOrder])
    useCancelOrdersBatchMock.mockReturnValue(cancelOrdersBatch)
    fetchAndClassifyOrderMock.mockResolvedValue({
      status: 'cancelled',
      order: { uid: 'swap-1' } as EnrichedOrder,
    })

    render(<PendingOrdersUpdater />)

    await waitFor(() => {
      expect(cancelOrdersBatch).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      jest.advanceTimersByTime(MARKET_OPERATOR_API_POLL_INTERVAL * 2)
    })

    expect(fetchAndClassifyOrderMock).toHaveBeenCalledTimes(1)
    expect(cancelOrdersBatch).toHaveBeenCalledTimes(1)
  })
})
