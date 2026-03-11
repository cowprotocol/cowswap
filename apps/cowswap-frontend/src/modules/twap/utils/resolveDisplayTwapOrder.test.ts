import { resolveDisplayTwapOrder } from './resolveDisplayTwapOrder'

import { DEFAULT_TWAP_EXECUTION_INFO } from '../const'
import { TwapOrderItem, TwapOrderStatus } from '../types'

const baseOrder: TwapOrderItem = {
  id: 'prototype-order',
  chainId: 1,
  submissionDate: new Date('2026-03-09T10:00:00.000Z').toISOString(),
  executedDate: new Date('2026-03-09T10:01:00.000Z').toISOString(),
  safeAddress: '0x0000000000000000000000000000000000000001',
  status: TwapOrderStatus.Pending,
  isPrototype: true,
  executionInfo: {
    confirmedPartsCount: 0,
    info: DEFAULT_TWAP_EXECUTION_INFO,
  },
  order: {
    sellToken: '0x0000000000000000000000000000000000000002',
    buyToken: '0x0000000000000000000000000000000000000003',
    receiver: '0x0000000000000000000000000000000000000001',
    partSellAmount: '100',
    minPartLimit: '50',
    t0: 0,
    n: 7,
    t: 300,
    span: 0,
    appData: '0x00',
  },
}

describe('resolveDisplayTwapOrder()', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-09T12:00:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('resolves a stale prototype pending order to expired for display', () => {
    expect(resolveDisplayTwapOrder(baseOrder).status).toBe(TwapOrderStatus.Expired)
  })

  it('preserves cancelling status for prototype orders', () => {
    expect(resolveDisplayTwapOrder({ ...baseOrder, status: TwapOrderStatus.Cancelling }).status).toBe(
      TwapOrderStatus.Cancelling,
    )
  })

  it('updates prototype execution info while the order auto-progresses', () => {
    const order = resolveDisplayTwapOrder({
      ...baseOrder,
      submissionDate: new Date('2026-03-09T11:59:30.000Z').toISOString(),
      executedDate: new Date('2026-03-09T11:59:30.000Z').toISOString(),
      prototypeSimulation: {
        partProgressMs: 8_000,
        maxConfirmedParts: 2,
      },
    })

    expect(order.status).toBe(TwapOrderStatus.Pending)
    expect(order.executionInfo.confirmedPartsCount).toBe(2)
    expect(order.executionInfo.info.executedSellAmount).toBe('200')
    expect(order.executedDate).toBe(new Date('2026-03-09T11:44:30.000Z').toISOString())
  })

  it('expires partially progressed prototype orders once the simulated timeline finishes', () => {
    jest.setSystemTime(new Date('2026-03-09T12:01:00.000Z'))

    const order = resolveDisplayTwapOrder({
      ...baseOrder,
      submissionDate: new Date('2026-03-09T12:00:00.000Z').toISOString(),
      executedDate: new Date('2026-03-09T12:00:00.000Z').toISOString(),
      prototypeSimulation: {
        partProgressMs: 8_000,
        maxConfirmedParts: 2,
      },
    })

    expect(order.status).toBe(TwapOrderStatus.Expired)
    expect(order.executionInfo.confirmedPartsCount).toBe(2)
  })
})
