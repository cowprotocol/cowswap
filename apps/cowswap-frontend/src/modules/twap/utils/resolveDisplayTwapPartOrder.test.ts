import { createPartOrderFromParent } from './buildTwapParts'
import { resolveDisplayTwapOrder } from './resolveDisplayTwapOrder'
import { resolveDisplayTwapPartOrder } from './resolveDisplayTwapPartOrder'

import { DEFAULT_TWAP_EXECUTION_INFO } from '../const'
import { TwapPartOrderItem } from '../state/twapPartOrdersAtom'
import { TwapOrderItem, TwapOrderStatus } from '../types'

const baseOrder: TwapOrderItem = {
  id: 'prototype-order',
  chainId: 1,
  submissionDate: new Date('2026-03-09T12:00:00.000Z').toISOString(),
  executedDate: new Date('2026-03-09T12:00:00.000Z').toISOString(),
  safeAddress: '0x0000000000000000000000000000000000000001',
  status: TwapOrderStatus.Pending,
  isPrototype: true,
  prototypeSimulation: {
    partProgressMs: 8_000,
    maxConfirmedParts: 2,
  },
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

describe('resolveDisplayTwapPartOrder()', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-09T12:00:30.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('keeps child part timing aligned with the simulated parent timeline', () => {
    const partOrder = createPartOrderFromParent(baseOrder, 1)

    if (!partOrder) {
      throw new Error('Part order was not created')
    }

    const item: TwapPartOrderItem = {
      uid: 'part-order',
      index: 1,
      chainId: 1,
      safeAddress: baseOrder.safeAddress,
      twapOrderId: baseOrder.id,
      isCreatedInOrderBook: false,
      isCancelling: false,
      isPrototype: true,
      order: partOrder,
    }

    const resolvedParent = resolveDisplayTwapOrder(baseOrder)
    const resolvedItem = resolveDisplayTwapPartOrder(item, resolvedParent)

    expect(resolvedItem.order.validTo).toBe(partOrder.validTo - 900)
  })
})
