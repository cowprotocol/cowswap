import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import { EnrichedOrder, OrderStatus } from '@cowprotocol/cow-sdk'

import { getOrders } from 'api/cowProtocol'

import { checkIfTraderHasPastTrades } from './checkIfTraderHasPastTrades'

import { AFFILIATE_SUPPORTED_CHAIN_IDS } from '../config/affiliateProgram.const'

jest.mock('api/cowProtocol', () => ({
  getOrders: jest.fn(),
}))

const getOrdersMock = getOrders as jest.MockedFunction<typeof getOrders>
const OWNER = '0x1111111111111111111111111111111111111111'

function buildOrder(overrides: Partial<EnrichedOrder> = {}): EnrichedOrder {
  return {
    fullAppData: JSON.stringify({ appCode: DEFAULT_APP_CODE, metadata: {}, version: '1.0.0' }),
    executedBuyAmount: '1',
    executedSellAmountBeforeFees: '0',
    status: OrderStatus.OPEN,
    ...overrides,
  } as EnrichedOrder
}

describe('checkIfTraderHasPastTrades', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getOrdersMock.mockResolvedValue([])
  })

  it('returns true when at least one relevant order exists', async () => {
    // arrange
    getOrdersMock.mockResolvedValue([
      buildOrder(),
      buildOrder({
        fullAppData: JSON.stringify({ appCode: 'Safe App', metadata: {}, version: '1.0.0' }),
      }),
    ])

    // act
    const result = await checkIfTraderHasPastTrades(OWNER)

    // assert
    expect(result).toBe(true)
  })

  it('returns false for integrator-only order history', async () => {
    // arrange
    getOrdersMock.mockResolvedValue([
      buildOrder({
        fullAppData: JSON.stringify({ appCode: 'Safe App', metadata: {}, version: '1.0.0' }),
      }),
      buildOrder({
        fullAppData: JSON.stringify({ appCode: 'Another Integrator', metadata: {}, version: '1.0.0' }),
      }),
    ])

    // act
    const result = await checkIfTraderHasPastTrades(OWNER)

    // assert
    expect(result).toBe(false)
  })

  it('returns false when only cancelled or expired orders exist', async () => {
    // arrange
    getOrdersMock.mockResolvedValue([
      buildOrder({ status: OrderStatus.CANCELLED }),
      buildOrder({ status: OrderStatus.EXPIRED }),
    ])

    // act
    const result = await checkIfTraderHasPastTrades(OWNER)

    // assert
    expect(result).toBe(false)
  })

  it('returns false when all orders have zero execution', async () => {
    // arrange
    getOrdersMock.mockResolvedValue([
      buildOrder({ executedBuyAmount: '0', executedSellAmountBeforeFees: '0' }),
      buildOrder({ executedBuyAmount: '0', executedSellAmountBeforeFees: '0' }),
    ])

    // act
    const result = await checkIfTraderHasPastTrades(OWNER)

    // assert
    expect(result).toBe(false)
  })

  it('returns true when one chain/env fails but another has a relevant order', async () => {
    // arrange
    getOrdersMock.mockImplementation((_, context) => {
      if (context.env === 'prod' && context.chainId === AFFILIATE_SUPPORTED_CHAIN_IDS[0]) {
        return Promise.reject(new Error('network error'))
      }

      if (context.env === 'staging' && context.chainId === AFFILIATE_SUPPORTED_CHAIN_IDS[0]) {
        return Promise.resolve([buildOrder()])
      }

      return Promise.resolve([])
    })

    // act
    const result = await checkIfTraderHasPastTrades(OWNER)

    // assert
    expect(result).toBe(true)
  })
})
