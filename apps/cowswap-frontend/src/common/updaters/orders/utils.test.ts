import {
  EnrichedOrder,
  OrderClass,
  OrderKind,
  OrderStatus as ApiOrderStatus,
  SigningScheme,
  SupportedChainId,
} from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { getOrder } from 'api/cowProtocol'

import { fetchAndClassifyOrder, getOrdersFromTransitionData, getOrderTypesByUid, OrderTransitionData } from './utils'

jest.mock('api/cowProtocol', () => ({
  getOrder: jest.fn(),
}))

const getOrderMock = getOrder as jest.MockedFunction<typeof getOrder>

const CHAIN_ID = SupportedChainId.MAINNET

function buildApiOrder(overrides: Partial<EnrichedOrder> = {}): EnrichedOrder {
  return {
    uid: '0xapi-order',
    owner: '0xowner',
    sellToken: '0x0000000000000000000000000000000000000001',
    buyToken: '0x0000000000000000000000000000000000000002',
    receiver: null,
    sellAmount: '100',
    buyAmount: '100',
    validTo: Math.floor(Date.now() / 1000) + 3600,
    feeAmount: '0',
    kind: OrderKind.SELL,
    partiallyFillable: false,
    signingScheme: SigningScheme.EIP712,
    signature: '0xsignature',
    creationDate: new Date().toISOString(),
    class: OrderClass.LIMIT,
    executedSellAmount: '100',
    executedSellAmountBeforeFees: '100',
    executedBuyAmount: '100',
    executedFeeAmount: '0',
    invalidated: false,
    status: ApiOrderStatus.OPEN,
    totalFee: '0',
    ...overrides,
  } as EnrichedOrder
}

function buildStoredOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: '0xstored-order',
    owner: '0xowner',
    class: OrderClass.LIMIT,
    status: OrderStatus.PENDING,
    creationTime: new Date().toISOString(),
    sellAmountBeforeFee: '100',
    fullAppData: undefined,
    ...overrides,
  } as Order
}

describe('order updater utils', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchAndClassifyOrder', () => {
    it('keeps the fetched API order intact while deriving TWAP from the stored child order metadata', async () => {
      const apiOrder = buildApiOrder({
        uid: '0xtwap-child',
        class: OrderClass.LIMIT,
        fullAppData: undefined,
      })
      const storedOrder = buildStoredOrder({
        id: '0xtwap-child',
        class: OrderClass.LIMIT,
        composableCowInfo: { parentId: '0xtwap-parent', isVirtualPart: false },
      })

      getOrderMock.mockResolvedValue(apiOrder)

      const result = await fetchAndClassifyOrder(storedOrder, CHAIN_ID)

      expect(getOrderMock).toHaveBeenCalledWith(CHAIN_ID, '0xtwap-child', 'prod')
      expect(result).toEqual({
        status: 'fulfilled',
        order: apiOrder,
        orderType: UiOrderType.TWAP,
      })
      expect(result?.order).toBe(apiOrder)
    })

    it.each([
      {
        name: 'market swap',
        storedOrder: buildStoredOrder({ id: '0xswap', class: OrderClass.MARKET }),
        expectedOrderType: UiOrderType.SWAP,
      },
      {
        name: 'limit order',
        storedOrder: buildStoredOrder({ id: '0xlimit', class: OrderClass.LIMIT }),
        expectedOrderType: UiOrderType.LIMIT,
      },
    ])('derives $expectedOrderType from the stored $name', async ({ storedOrder, expectedOrderType }) => {
      const apiOrder = buildApiOrder({ uid: storedOrder.id, class: OrderClass.LIMIT })

      getOrderMock.mockResolvedValue(apiOrder)

      await expect(fetchAndClassifyOrder(storedOrder, CHAIN_ID)).resolves.toMatchObject({
        status: 'fulfilled',
        order: apiOrder,
        orderType: expectedOrderType,
      })
      expect(getOrderMock).toHaveBeenCalledWith(CHAIN_ID, storedOrder.id, undefined)
    })

    it('does not fetch creating orders', async () => {
      const storedOrder = buildStoredOrder({ status: OrderStatus.CREATING })

      await expect(fetchAndClassifyOrder(storedOrder, CHAIN_ID)).resolves.toBeNull()
      expect(getOrderMock).not.toHaveBeenCalled()
    })
  })

  describe('transition data helpers', () => {
    it('extracts raw API orders for state updates and keeps orderType in a separate analytics lookup', () => {
      const swapOrder = buildApiOrder({ uid: '0xswap' })
      const twapOrder = buildApiOrder({ uid: '0xtwap' })
      const transitionData: OrderTransitionData[] = [
        { status: 'fulfilled', order: swapOrder, orderType: UiOrderType.SWAP },
        { status: 'cancelled', order: twapOrder, orderType: UiOrderType.TWAP },
      ]

      expect(getOrdersFromTransitionData(transitionData)).toEqual([swapOrder, twapOrder])
      expect(getOrdersFromTransitionData(transitionData)[0]).toBe(swapOrder)
      expect(getOrdersFromTransitionData(transitionData)[1]).toBe(twapOrder)
      expect(getOrderTypesByUid(transitionData)).toEqual({
        '0xswap': UiOrderType.SWAP,
        '0xtwap': UiOrderType.TWAP,
      })
    })
  })
})
