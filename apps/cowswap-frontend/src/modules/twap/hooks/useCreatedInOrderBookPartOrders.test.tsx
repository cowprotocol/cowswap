import { useAtomValue } from 'jotai'

import { EnrichedOrder, SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook, waitFor } from '@testing-library/react'
import { twapOrdersAtom } from 'entities/twap'

import { Order } from 'legacy/state/orders/actions'

import { useSWRProdOrders, useTokensForOrdersList } from 'modules/orders'

import { useCreatedInOrderBookPartOrders } from './useCreatedInOrderBookPartOrders'

import { useTwapPartOrdersCache } from '../hooks/useTwapPartOrdersCache'
import { twapPartOrdersListAtom, type TwapPartOrderItem } from '../state/twapPartOrdersAtom'
import { TwapPartOrdersCacheByUid } from '../state/twapPartOrdersCacheAtom'
import { TwapOrderStatus } from '../types'
import { fetchMissingPartOrders } from '../updaters/fetchMissingPartOrders'
import { mapPartOrderToStoreOrder } from '../utils/mapPartOrderToStoreOrder'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
}))

jest.mock('modules/orders')
jest.mock('../hooks/useTwapPartOrdersCache')
jest.mock('../updaters/fetchMissingPartOrders')
jest.mock('../utils/mapPartOrderToStoreOrder')

const useAtomValueMock = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const useSWRProdOrdersMock = useSWRProdOrders as jest.MockedFunction<typeof useSWRProdOrders>
const useTokensForOrdersListMock = useTokensForOrdersList as jest.MockedFunction<typeof useTokensForOrdersList>
const useTwapPartOrdersCacheMock = useTwapPartOrdersCache as jest.MockedFunction<typeof useTwapPartOrdersCache>
const fetchMissingPartOrdersMock = fetchMissingPartOrders as jest.MockedFunction<typeof fetchMissingPartOrders>
const mapPartOrderToStoreOrderMock = mapPartOrderToStoreOrder as jest.MockedFunction<typeof mapPartOrderToStoreOrder>

function createTestOrder(uid: string): EnrichedOrder {
  return { uid } as EnrichedOrder
}

const ACCOUNT = '0x1111111111111111111111111111111111111111'

const defaultTwapOrders = {
  'twap-1': {
    id: 'twap-1',
    status: TwapOrderStatus.Fulfilled,
  },
  'twap-2': {
    id: 'twap-2',
    status: TwapOrderStatus.Pending,
  },
}

describe('useCreatedInOrderBookPartOrders', () => {
  let mockPartOrdersList: TwapPartOrderItem[]

  beforeEach(() => {
    jest.clearAllMocks()

    mockPartOrdersList = []
    useAtomValueMock.mockImplementation((atom) => {
      if (atom === twapPartOrdersListAtom) {
        return mockPartOrdersList
      }
      if (atom === twapOrdersAtom) {
        return defaultTwapOrders
      }
      return undefined
    })
    useSWRProdOrdersMock.mockReturnValue([])
    useTokensForOrdersListMock.mockReturnValue(jest.fn(() => Promise.resolve({})))
    mapPartOrderToStoreOrderMock.mockImplementation((item) => ({ id: item.uid }) as Order)
  })

  it('fetches only non-finalized-cached part IDs and returns mapped orders + cache entries', async () => {
    // arrange
    const partOrdersList: TwapPartOrderItem[] = [
      { uid: 'order_part_1', twapOrderId: 'twap-1' } as TwapPartOrderItem,
      { uid: 'order_part_2', twapOrderId: 'twap-2' } as TwapPartOrderItem,
    ]
    const existingOrdersByUid: TwapPartOrdersCacheByUid = {}
    const partOrderIds = ['order_part_1']

    mockPartOrdersList = partOrdersList
    useTwapPartOrdersCacheMock.mockReturnValue({
      cacheByUid: existingOrdersByUid,
      cachedFinalizedTwapOrderIds: new Set(['twap-2']),
    })
    fetchMissingPartOrdersMock.mockResolvedValue([createTestOrder('order_part_1')])

    // act
    const { result } = renderHook(() =>
      useCreatedInOrderBookPartOrders({
        chainId: SupportedChainId.MAINNET,
        owner: ACCOUNT,
      }),
    )

    // assert
    await waitFor(() => {
      expect(result.current.orders).toEqual([{ id: 'order_part_1' }])
    })

    expect(fetchMissingPartOrdersMock).toHaveBeenCalledWith(
      SupportedChainId.MAINNET,
      ACCOUNT,
      partOrderIds,
      existingOrdersByUid,
      expect.any(AbortSignal),
    )
    expect(result.current.cacheEntries).toEqual({
      order_part_1: {
        twapOrderId: 'twap-1',
        enrichedOrder: createTestOrder('order_part_1'),
      },
    })
  })

  it('skips fallback fetch when all part orders are in finalized cache and still maps from cache', async () => {
    // arrange
    const partOrdersList: TwapPartOrderItem[] = [{ uid: 'order_part_1', twapOrderId: 'twap-1' } as TwapPartOrderItem]
    const existingOrdersByUid: TwapPartOrdersCacheByUid = {
      order_part_1: {
        twapOrderId: 'twap-1',
        enrichedOrder: createTestOrder('order_part_1'),
      },
    }

    mockPartOrdersList = partOrdersList
    useTwapPartOrdersCacheMock.mockReturnValue({
      cacheByUid: existingOrdersByUid,
      cachedFinalizedTwapOrderIds: new Set(['twap-1']),
    })

    // act
    const { result } = renderHook(() =>
      useCreatedInOrderBookPartOrders({
        chainId: SupportedChainId.MAINNET,
        owner: ACCOUNT,
      }),
    )

    // assert
    await waitFor(() => {
      expect(result.current.orders).toEqual([{ id: 'order_part_1' }])
    })

    expect(fetchMissingPartOrdersMock).not.toHaveBeenCalled()
    expect(result.current.cacheEntries).toEqual({
      order_part_1: {
        twapOrderId: 'twap-1',
        enrichedOrder: createTestOrder('order_part_1'),
      },
    })
  })
})
