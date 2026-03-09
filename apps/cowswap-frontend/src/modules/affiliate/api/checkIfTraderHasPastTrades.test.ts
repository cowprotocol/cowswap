import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import { EnrichedOrder, OrderStatus } from '@cowprotocol/cow-sdk'

import { getOrders } from 'api/cowProtocol'

import { checkIfTraderHasPastTrades } from './checkIfTraderHasPastTrades'

import {
  AFFILIATE_SUPPORTED_CHAIN_IDS,
  PAST_ORDERS_SCAN_LIMIT,
  TRADE_ENVS_TO_CHECK,
} from '../config/affiliateProgram.const'

jest.mock('api/cowProtocol', () => ({
  getOrders: jest.fn(),
}))

const getOrdersMock = getOrders as jest.MockedFunction<typeof getOrders>
const OWNER = '0x1111111111111111111111111111111111111111'

function buildFullAppData(appCode: string, refCode?: string): string {
  return JSON.stringify({
    appCode,
    metadata: refCode ? { referrer: { code: refCode } } : {},
    version: '1.0.0',
  })
}

function buildOrder(overrides: Partial<EnrichedOrder> = {}): EnrichedOrder {
  return {
    fullAppData: JSON.stringify({ appCode: DEFAULT_APP_CODE, metadata: {}, version: '1.0.0' }),
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

  it('returns the first valid ref code from relevant orders', async () => {
    // arrange
    getOrdersMock.mockResolvedValue([
      buildOrder({
        fullAppData: buildFullAppData(DEFAULT_APP_CODE, 'abcde'),
      }),
    ])

    // act
    const result = await checkIfTraderHasPastTrades(OWNER)

    // assert
    expect(result).toEqual({ hasPastTrades: true, refCode: 'ABCDE' })
  })

  it('returns ref code from first valid CoW order when multiple executed CoW orders exist', async () => {
    // arrange
    getOrdersMock.mockResolvedValue([
      buildOrder({
        status: OrderStatus.FULFILLED,
        executedBuyAmount: '1',
        executedSellAmountBeforeFees: '1',
        fullAppData: buildFullAppData(DEFAULT_APP_CODE, 'FIRST'),
      }),
      buildOrder({
        status: OrderStatus.FULFILLED,
        executedBuyAmount: '1',
        executedSellAmountBeforeFees: '1',
        fullAppData: buildFullAppData(DEFAULT_APP_CODE, 'SECOND'),
      }),
    ])

    // act
    const result = await checkIfTraderHasPastTrades(OWNER)

    // assert
    expect(result).toEqual({ hasPastTrades: true, refCode: 'FIRST' })
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
    const expectedCallsCount = AFFILIATE_SUPPORTED_CHAIN_IDS.length * TRADE_ENVS_TO_CHECK.length
    expect(getOrdersMock).toHaveBeenCalledTimes(expectedCallsCount)

    const contexts = getOrdersMock.mock.calls.map(([, context]) => context)
    const envs = [...new Set(contexts.map((context) => context.env))].sort()
    const expectedEnvs = [...TRADE_ENVS_TO_CHECK].sort()

    expect(envs).toEqual(expectedEnvs)
    contexts.forEach((context) => {
      expect(context).toEqual(expect.objectContaining({ chainId: expect.any(Number), env: expect.any(String) }))
    })

    getOrdersMock.mock.calls.forEach(([params]) => {
      expect(params).toEqual(expect.objectContaining({ owner: OWNER, limit: PAST_ORDERS_SCAN_LIMIT }))
    })
  })
})
