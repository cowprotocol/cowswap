import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import { EnrichedOrder, OrderStatus } from '@cowprotocol/cow-sdk'

import { formatRefCode, isExecutedNonIntegratorOrder } from './affiliateProgramUtils'

function buildFullAppData(appCode: string): string {
  return JSON.stringify({
    version: '1.0.0',
    appCode,
    metadata: {},
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

describe('formatRefCode', () => {
  it('normalizes and validates referral code', () => {
    expect(formatRefCode(' abcde ')).toBe('ABCDE')
  })

  it('rejects short codes', () => {
    expect(formatRefCode('ABCD')).toBeUndefined()
  })

  it('rejects long codes', () => {
    expect(formatRefCode('ABCDEFGHIJKLMNOPQRSTU')).toBeUndefined()
  })

  it('rejects invalid characters', () => {
    expect(formatRefCode('ABCD!')).toBeUndefined()
  })
})

describe('isExecutedNonIntegratorOrder', () => {
  it('returns true for executed UI orders', () => {
    // arrange
    const order = buildOrder()

    // act
    const result = isExecutedNonIntegratorOrder(order)

    // assert
    expect(result).toBe(true)
  })

  it('returns false for integrator orders', () => {
    // arrange
    const order = buildOrder({ fullAppData: buildFullAppData('Safe Widget') })

    // act
    const result = isExecutedNonIntegratorOrder(order)

    // assert
    expect(result).toBe(false)
  })

  it('returns false for cancelled orders', () => {
    // arrange
    const order = buildOrder({ status: OrderStatus.CANCELLED })

    // act
    const result = isExecutedNonIntegratorOrder(order)

    // assert
    expect(result).toBe(false)
  })

  it('returns false for expired orders', () => {
    // arrange
    const order = buildOrder({ status: OrderStatus.EXPIRED })

    // act
    const result = isExecutedNonIntegratorOrder(order)

    // assert
    expect(result).toBe(false)
  })

  it('returns false for zero-executed orders', () => {
    // arrange
    const order = buildOrder({ executedBuyAmount: '0', executedSellAmountBeforeFees: '0' })

    // act
    const result = isExecutedNonIntegratorOrder(order)

    // assert
    expect(result).toBe(false)
  })
})
