import { PENDING_ORDERS_BUFFER } from '@cowprotocol/common-const'
import { OrderStatus } from '@cowprotocol/cow-sdk'

import { isOrderExpired } from './isOrderExpired'

const NOW = 1_800_000_000_000
const nowSeconds = NOW / 1000

describe('isOrderExpired', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('is not expired before validTo', () => {
    expect(isOrderExpired({ validTo: nowSeconds + 60 })).toBe(false)
  })

  it('is not expired within the buffer after validTo', () => {
    expect(isOrderExpired({ validTo: nowSeconds - PENDING_ORDERS_BUFFER / 1000 + 1 })).toBe(false)
  })

  it('is expired once the buffer after validTo has passed', () => {
    expect(isOrderExpired({ validTo: nowSeconds - PENDING_ORDERS_BUFFER / 1000 - 1 })).toBe(true)
  })

  it('honours a custom threshold', () => {
    expect(isOrderExpired({ validTo: nowSeconds - 1 }, 0)).toBe(true)
  })

  it('trusts an expired status before validTo', () => {
    expect(isOrderExpired({ validTo: nowSeconds + 60, status: OrderStatus.EXPIRED })).toBe(true)
  })

  it('ignores other statuses before validTo', () => {
    expect(isOrderExpired({ validTo: nowSeconds + 60, status: OrderStatus.OPEN })).toBe(false)
  })
})
