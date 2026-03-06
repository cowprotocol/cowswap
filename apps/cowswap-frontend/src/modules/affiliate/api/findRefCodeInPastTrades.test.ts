import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import { EnrichedOrder, OrderStatus } from '@cowprotocol/cow-sdk'

import { getOrders } from 'api/cowProtocol'

import { findRefCodeInPastTrades } from './findRefCodeInPastTrades'

import { PAST_ORDERS_SCAN_LIMIT } from '../config/affiliateProgram.const'

jest.mock('api/cowProtocol', () => ({
  getOrders: jest.fn(),
}))

const getOrdersMock = getOrders as jest.MockedFunction<typeof getOrders>
const OWNER = '0x1111111111111111111111111111111111111111'

function buildFullAppData(appCode: string, code?: string): string {
  return JSON.stringify({
    version: '1.0.0',
    appCode,
    metadata: code ? { referrer: { code } } : {},
  })
}

function buildOrder(overrides: Partial<EnrichedOrder> = {}): EnrichedOrder {
  return {
    status: OrderStatus.OPEN,
    fullAppData: buildFullAppData(DEFAULT_APP_CODE),
    executedBuyAmount: '1',
    executedSellAmountBeforeFees: '0',
    ...overrides,
  } as EnrichedOrder
}

describe('findRefCodeInPastTrades', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getOrdersMock.mockResolvedValue([])
  })

  it('recovers ref code from valid CoW Swap orders', async () => {
    // arrange
    getOrdersMock.mockResolvedValue([buildOrder({ fullAppData: buildFullAppData(DEFAULT_APP_CODE, 'ABCDE') })])

    // act
    const result = await findRefCodeInPastTrades(OWNER)

    // assert
    expect(result).toBe('ABCDE')
  })

  it('ignores integrator orders for ref code recovery', async () => {
    // arrange
    getOrdersMock.mockResolvedValue([
      buildOrder({ fullAppData: buildFullAppData('Safe App', 'MALICE') }),
      buildOrder({ fullAppData: buildFullAppData(DEFAULT_APP_CODE, 'LEGIT1') }),
    ])

    // act
    const result = await findRefCodeInPastTrades(OWNER)

    // assert
    expect(result).toBe('LEGIT1')
  })

  it('ignores cancelled and expired orders', async () => {
    // arrange
    getOrdersMock.mockResolvedValue([
      buildOrder({ status: OrderStatus.CANCELLED, fullAppData: buildFullAppData(DEFAULT_APP_CODE, 'CANCEL') }),
      buildOrder({ status: OrderStatus.EXPIRED, fullAppData: buildFullAppData(DEFAULT_APP_CODE, 'EXPIRE') }),
      buildOrder({ status: OrderStatus.FULFILLED, fullAppData: buildFullAppData(DEFAULT_APP_CODE, 'VALID1') }),
    ])

    // act
    const result = await findRefCodeInPastTrades(OWNER)

    // assert
    expect(result).toBe('VALID1')
  })

  it('ignores zero-executed orders', async () => {
    // arrange
    getOrdersMock.mockResolvedValue([
      buildOrder({
        fullAppData: buildFullAppData(DEFAULT_APP_CODE, 'ZERO0'),
        executedBuyAmount: '0',
        executedSellAmountBeforeFees: '0',
      }),
      buildOrder({ fullAppData: buildFullAppData(DEFAULT_APP_CODE, 'VALID2'), executedBuyAmount: '4' }),
    ])

    // act
    const result = await findRefCodeInPastTrades(OWNER)

    // assert
    expect(result).toBe('VALID2')
  })

  it('uses order scan limit size of PAST_ORDERS_SCAN_LIMIT', async () => {
    // act
    await findRefCodeInPastTrades(OWNER)

    // assert
    expect(getOrdersMock).toHaveBeenCalledWith(
      { owner: OWNER, limit: PAST_ORDERS_SCAN_LIMIT },
      expect.objectContaining({ env: 'prod' }),
    )
  })
})
