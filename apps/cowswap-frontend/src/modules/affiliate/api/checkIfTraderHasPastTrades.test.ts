import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import { EnrichedOrder, OrderStatus } from '@cowprotocol/cow-sdk'

import { getOrders } from 'api/cowProtocol'

import { checkIfTraderHasPastTrades } from './checkIfTraderHasPastTrades'

import { AFFILIATE_SUPPORTED_CHAIN_IDS, PAST_ORDERS_SCAN_LIMIT } from '../config/affiliateProgram.const'

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
        fullAppData: JSON.stringify({ appCode: 'Safe Widget', metadata: {}, version: '1.0.0' }),
      }),
    ])

    // act
    const result = await checkIfTraderHasPastTrades(OWNER)

    // assert
    expect(result).toEqual({ hasPastTrades: true, refCode: undefined })
  })

  it('returns false for integrator-only order history', async () => {
    // arrange
    getOrdersMock.mockResolvedValue([
      buildOrder({
        fullAppData: JSON.stringify({ appCode: 'Safe Widget', metadata: {}, version: '1.0.0' }),
      }),
      buildOrder({
        fullAppData: JSON.stringify({ appCode: 'Another Integrator', metadata: {}, version: '1.0.0' }),
      }),
    ])

    // act
    const result = await checkIfTraderHasPastTrades(OWNER)

    // assert
    expect(result).toEqual({ hasPastTrades: false, refCode: undefined })
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
    expect(result).toEqual({ hasPastTrades: false, refCode: undefined })
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
    expect(result).toEqual({ hasPastTrades: false, refCode: undefined })
  })

  it('returns the first valid ref code from relevant orders', async () => {
    // arrange
    getOrdersMock.mockResolvedValue([
      buildOrder({
        fullAppData: JSON.stringify({
          appCode: DEFAULT_APP_CODE,
          metadata: { referrer: { code: 'abcde' } },
          version: '1.0.0',
        }),
      }),
    ])

    // act
    const result = await checkIfTraderHasPastTrades(OWNER)

    // assert
    expect(result).toEqual({ hasPastTrades: true, refCode: 'ABCDE' })
  })

  it('ignores integrator and invalid ref codes while scanning relevant orders', async () => {
    // arrange
    getOrdersMock.mockResolvedValue([
      buildOrder({
        fullAppData: JSON.stringify({
          appCode: 'Safe Widget',
          metadata: { referrer: { code: 'MALICE' } },
          version: '1.0.0',
        }),
      }),
      buildOrder({
        fullAppData: JSON.stringify({
          appCode: DEFAULT_APP_CODE,
          metadata: { referrer: { code: 'bad code' } },
          version: '1.0.0',
        }),
      }),
      buildOrder({
        fullAppData: JSON.stringify({
          appCode: DEFAULT_APP_CODE,
          metadata: { referrer: { code: 'LEGIT1' } },
          version: '1.0.0',
        }),
      }),
    ])

    // act
    const result = await checkIfTraderHasPastTrades(OWNER)

    // assert
    expect(result).toEqual({ hasPastTrades: true, refCode: 'LEGIT1' })
  })

  it('returns past-trade data when one chain/env fails but another has a relevant order', async () => {
    // arrange
    getOrdersMock.mockImplementation((_, context) => {
      if (context.env === 'prod' && context.chainId === AFFILIATE_SUPPORTED_CHAIN_IDS[0]) {
        return Promise.reject(new Error('network error'))
      }

      if (context.env === 'staging' && context.chainId === AFFILIATE_SUPPORTED_CHAIN_IDS[0]) {
        return Promise.resolve([
          buildOrder({
            fullAppData: JSON.stringify({
              appCode: DEFAULT_APP_CODE,
              metadata: { referrer: { code: 'VALID1' } },
              version: '1.0.0',
            }),
          }),
        ])
      }

      return Promise.resolve([])
    })

    // act
    const result = await checkIfTraderHasPastTrades(OWNER)

    // assert
    expect(result).toEqual({ hasPastTrades: true, refCode: 'VALID1' })
  })

  it('uses order scan limit size of PAST_ORDERS_SCAN_LIMIT', async () => {
    // act
    await checkIfTraderHasPastTrades(OWNER)

    // assert
    expect(getOrdersMock).toHaveBeenCalledWith(
      { owner: OWNER, limit: PAST_ORDERS_SCAN_LIMIT },
      expect.objectContaining({ env: 'prod' }),
    )
  })
})
