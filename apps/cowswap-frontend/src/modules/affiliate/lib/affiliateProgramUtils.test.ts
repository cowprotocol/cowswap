import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import { EnrichedOrder, OrderStatus } from '@cowprotocol/cow-sdk'

import { extractFullAppDataFromResponse, formatRefCode, isExecutedNonIntegratorOrder } from './affiliateProgramUtils'

function buildFullAppData(appCode: string): string {
  return JSON.stringify({
    version: '1.0.0',
    appCode,
    metadata: {},
  })
}

function buildOrder(overrides: Partial<EnrichedOrder> = {}): EnrichedOrder {
  return {
    executedBuyAmount: '1',
    fullAppData: buildFullAppData(DEFAULT_APP_CODE),
    status: OrderStatus.FULFILLED,
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

describe('extractFullAppDataFromResponse', () => {
  const fullAppData = buildFullAppData(DEFAULT_APP_CODE)
  const appDataHash = '0x6b29c96a56b70162fa3e7ab6847df043179b27232d57155d531fdc4ac8179218'

  it('returns full appData fields', () => {
    expect(extractFullAppDataFromResponse({ fullAppData })).toBe(fullAppData)
    expect(extractFullAppDataFromResponse({ full_app_data: fullAppData })).toBe(fullAppData)
  })

  it('ignores appData hash fields', () => {
    expect(extractFullAppDataFromResponse({ appData: appDataHash })).toBeUndefined()
    expect(extractFullAppDataFromResponse(appDataHash)).toBeUndefined()
  })

  it('uses appData only when it contains full appData', () => {
    expect(extractFullAppDataFromResponse({ appData: fullAppData })).toBe(fullAppData)
  })

  it('falls back to document when appData is only a hash', () => {
    const document = { appCode: DEFAULT_APP_CODE, metadata: {}, version: '1.0.0' }

    expect(extractFullAppDataFromResponse({ appData: appDataHash, document })).toBe(JSON.stringify(document))
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

  it('does not decode hash-only appData from local order state', () => {
    // arrange
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()
    const order = buildOrder({
      appData: '0x6b29c96a56b70162fa3e7ab6847df043179b27232d57155d531fdc4ac8179218',
      fullAppData: undefined,
    })

    // act
    const result = isExecutedNonIntegratorOrder(order)

    // assert
    expect(result).toBe(false)
    expect(consoleInfoSpy).not.toHaveBeenCalled()

    consoleInfoSpy.mockRestore()
  })
})
