/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAtom, useSetAtom } from 'jotai'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { isSellOrder } from '@cowprotocol/common-utils'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import { renderHook } from '@testing-library/react'
import useSWR from 'swr'

import { PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL } from 'legacy/state/orders/consts'

import { GenericOrder } from 'common/types'

import { UnfillableOrderUpdater } from './UnfillableOrderUpdater'

import { useIsProviderNetworkUnsupported } from '../../../../hooks/useIsProviderNetworkUnsupported'
import { useUpdateIsUnfillableFlag } from '../hooks/useUpdateIsUnfillableFlag'
import { fetchOrderPrice } from '../services/fetchOrderPrice'

// Mock all dependencies
jest.mock('jotai', () => ({
  atom: jest.fn(),
  useAtom: jest.fn(),
  useSetAtom: jest.fn(),
}))

jest.mock('@cowprotocol/common-hooks', () => ({
  useIsWindowVisible: jest.fn(),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  isSellOrder: jest.fn(),
}))

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('../../../../hooks/useIsProviderNetworkUnsupported', () => ({
  useIsProviderNetworkUnsupported: jest.fn(),
}))

jest.mock('../hooks/useUpdateIsUnfillableFlag', () => ({
  useUpdateIsUnfillableFlag: jest.fn(),
}))

jest.mock('../services/fetchOrderPrice', () => ({
  fetchOrderPrice: jest.fn(),
}))

jest.mock('modules/orders/state/pendingOrdersPricesAtom', () => ({
  updatePendingOrderPricesAtom: Symbol('updatePendingOrderPricesAtom'),
}))

const mockedUseAtom = useAtom as jest.MockedFunction<typeof useAtom>
const mockedUseSetAtom = useSetAtom as jest.MockedFunction<typeof useSetAtom>
const mockedUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
const mockedUseIsWindowVisible = useIsWindowVisible as jest.MockedFunction<typeof useIsWindowVisible>
const mockedIsSellOrder = isSellOrder as jest.MockedFunction<typeof isSellOrder>
const mockedUseIsProviderNetworkUnsupported = useIsProviderNetworkUnsupported as jest.MockedFunction<
  typeof useIsProviderNetworkUnsupported
>
const mockedUseUpdateIsUnfillableFlag = useUpdateIsUnfillableFlag as jest.MockedFunction<
  typeof useUpdateIsUnfillableFlag
>
const mockedFetchOrderPrice = fetchOrderPrice as jest.MockedFunction<typeof fetchOrderPrice>

describe('UnfillableOrderUpdater', () => {
  const mockChainId = SupportedChainId.MAINNET
  const mockUpdatePendingOrderPrices = jest.fn()
  const mockUpdateIsUnfillableFlag = jest.fn()
  const mockSetOrderLastTimePriceUpdate = jest.fn()

  const mockToken1 = new Token(mockChainId, '0x0000000000000000000000000000000000000001', 18, 'TEST1', 'Test Token 1')
  const mockToken2 = new Token(mockChainId, '0x0000000000000000000000000000000000000002', 18, 'TEST2', 'Test Token 2')

  const mockOrder: GenericOrder = {
    id: 'order-123',
    kind: OrderKind.SELL,
    inputToken: mockToken1,
    outputToken: mockToken2,
    sellAmount: '1000000000000000000', // 1 token
    buyAmount: '2000000000000000000', // 2 tokens
    feeAmount: '10000000000000000', // 0.01 token
    owner: '0xowner',
    receiver: '0xreceiver',
    partiallyFillable: false,
  } as GenericOrder

  const mockQuoteResponse = {
    quoteResponse: {
      quote: {
        kind: OrderKind.SELL,
        buyAmount: '2000000000000000000',
        sellAmount: '1000000000000000000',
        feeAmount: '10000000000000000', // 0.01 token
      },
      expiration: '2024-01-01T00:00:00.000Z',
      verified: true,
    },
    tradeParameters: {},
    suggestedSlippageBps: 50,
    amountsAndCosts: {},
    orderToSign: {},
    priceImpact: 0.1,
    deadline: new Date(),
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Date, 'now').mockReturnValue(1000000000)

    // Default mocks
    mockedUseAtom.mockReturnValue([{}, mockSetOrderLastTimePriceUpdate] as any)
    mockedUseSetAtom.mockImplementation((atom: any) => {
      if (atom.toString().includes('updatePendingOrderPricesAtom')) {
        return mockUpdatePendingOrderPrices
      }
      return jest.fn()
    })
    mockedUseUpdateIsUnfillableFlag.mockReturnValue(mockUpdateIsUnfillableFlag)
    mockedUseIsProviderNetworkUnsupported.mockReturnValue(false)
    mockedUseIsWindowVisible.mockReturnValue(true)
    mockedIsSellOrder.mockReturnValue(true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('successful quote response handling', () => {
    let swrFetcher: (args: [GenericOrder, jest.Mock, SupportedChainId]) => Promise<void>

    beforeEach(() => {
      mockedUseAtom.mockReturnValue([{}, mockSetOrderLastTimePriceUpdate] as any)
      renderHook(() => UnfillableOrderUpdater({ chainId: mockChainId, order: mockOrder }))
      const swrCall = mockedUseSWR.mock.calls[0]
      swrFetcher = swrCall[1] as typeof swrFetcher
    })

    it('should handle successful quote response for sell order', async () => {
      mockedIsSellOrder.mockReturnValue(true)
      mockedFetchOrderPrice.mockResolvedValue(mockQuoteResponse)

      await swrFetcher([mockOrder, mockSetOrderLastTimePriceUpdate, mockChainId])

      expect(mockUpdateIsUnfillableFlag).toHaveBeenCalledWith(
        mockChainId,
        mockOrder,
        mockQuoteResponse.quoteResponse.quote.buyAmount,
        mockQuoteResponse.quoteResponse.quote.feeAmount,
      )
    })

    it('should handle successful quote response for buy order', async () => {
      mockedIsSellOrder.mockReturnValue(false)
      mockedFetchOrderPrice.mockResolvedValue(mockQuoteResponse)

      await swrFetcher([mockOrder, mockSetOrderLastTimePriceUpdate, mockChainId])

      expect(mockUpdateIsUnfillableFlag).toHaveBeenCalledWith(
        mockChainId,
        mockOrder,
        mockQuoteResponse.quoteResponse.quote.sellAmount,
        mockQuoteResponse.quoteResponse.quote.feeAmount,
      )
    })

    it('should not call updateIsUnfillableFlag when fetchOrderPrice returns null', async () => {
      mockedFetchOrderPrice.mockResolvedValue(null)

      await swrFetcher([mockOrder, mockSetOrderLastTimePriceUpdate, mockChainId])

      expect(mockUpdateIsUnfillableFlag).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    let swrFetcher: (args: [GenericOrder, jest.Mock, SupportedChainId]) => Promise<void>

    beforeEach(() => {
      mockedUseAtom.mockReturnValue([{}, mockSetOrderLastTimePriceUpdate] as any)
      renderHook(() => UnfillableOrderUpdater({ chainId: mockChainId, order: mockOrder }))
      const swrCall = mockedUseSWR.mock.calls[0]
      swrFetcher = swrCall[1] as typeof swrFetcher
    })

    it('should handle fetchOrderPrice rejection', async () => {
      const mockError = new Error('Fetch failed')
      mockedFetchOrderPrice.mockRejectedValue(mockError)

      // Call the swrFetcher and wait for async operations to complete
      await swrFetcher([mockOrder, mockSetOrderLastTimePriceUpdate, mockChainId])

      // Wait a bit for the promise chain to complete
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(mockUpdatePendingOrderPrices).toHaveBeenCalledWith({
        orderId: mockOrder.id,
        data: null,
      })
    })

    it('should not call updateIsUnfillableFlag on error', async () => {
      mockedFetchOrderPrice.mockRejectedValue(new Error('Fetch failed'))

      await swrFetcher([mockOrder, mockSetOrderLastTimePriceUpdate, mockChainId])

      expect(mockUpdateIsUnfillableFlag).not.toHaveBeenCalled()
    })
  })

  describe('time-based update logic', () => {
    let swrFetcher: (args: [GenericOrder, jest.Mock, SupportedChainId]) => Promise<void>

    beforeEach(() => {
      renderHook(() => UnfillableOrderUpdater({ chainId: mockChainId, order: mockOrder }))
      swrFetcher = mockedUseSWR.mock.calls[0][1] as typeof swrFetcher
    })

    it('should calculate time difference correctly', async () => {
      const currentTime = 1000000000
      const lastUpdate = currentTime - PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL + 1000 // 29 seconds ago

      // Set up the component with the lastUpdate time first
      mockedUseAtom.mockReturnValue([{ [mockOrder.id]: lastUpdate }, mockSetOrderLastTimePriceUpdate] as any)
      renderHook(() => UnfillableOrderUpdater({ chainId: mockChainId, order: mockOrder }))

      // Get the new fetcher that has the ref with lastUpdate value
      const newSwrFetcher = mockedUseSWR.mock.calls[mockedUseSWR.mock.calls.length - 1][1] as typeof swrFetcher
      jest.spyOn(Date, 'now').mockReturnValue(currentTime)

      const result = await newSwrFetcher([mockOrder, mockSetOrderLastTimePriceUpdate, mockChainId])

      expect(result).toBeUndefined()
      expect(mockedFetchOrderPrice).not.toHaveBeenCalled()
    })

    it('should proceed when exactly at threshold', async () => {
      const currentTime = 1000000000
      const lastUpdate = currentTime - PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL // Exactly 30 seconds ago

      mockedUseAtom.mockReturnValue([{ [mockOrder.id]: lastUpdate }, mockSetOrderLastTimePriceUpdate] as any)
      jest.spyOn(Date, 'now').mockReturnValue(currentTime)
      mockedFetchOrderPrice.mockResolvedValue(mockQuoteResponse)

      await swrFetcher([mockOrder, mockSetOrderLastTimePriceUpdate, mockChainId])

      expect(mockedFetchOrderPrice).toHaveBeenCalledWith(mockChainId, mockOrder)
    })
  })
})
