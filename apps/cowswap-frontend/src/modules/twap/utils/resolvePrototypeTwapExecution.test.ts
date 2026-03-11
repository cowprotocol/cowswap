import { resolvePrototypeTwapExecution } from './resolvePrototypeTwapExecution'

import { DEFAULT_TWAP_EXECUTION_INFO } from '../const'
import { TwapOrderItem, TwapOrderStatus } from '../types'

const baseOrder: TwapOrderItem = {
  id: 'prototype-order',
  chainId: 1,
  submissionDate: new Date('2026-03-09T10:00:00.000Z').toISOString(),
  executedDate: new Date('2026-03-09T10:00:00.000Z').toISOString(),
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

describe('resolvePrototypeTwapExecution()', () => {
  it('advances confirmed parts using the prototype simulation interval', () => {
    const execution = resolvePrototypeTwapExecution(baseOrder, new Date('2026-03-09T10:00:19.000Z').getTime())

    expect(execution.confirmedPartsCount).toBe(2)
    expect(execution.info.executedSellAmount).toBe('200')
    expect(execution.info.executedBuyAmount).toBe('100')
  })

  it('stops advancing once the configured max confirmed parts is reached', () => {
    const execution = resolvePrototypeTwapExecution(baseOrder, new Date('2026-03-09T10:02:00.000Z').getTime())

    expect(execution.confirmedPartsCount).toBe(2)
  })

  it('does not auto-progress cancelling prototype orders', () => {
    const execution = resolvePrototypeTwapExecution(
      { ...baseOrder, status: TwapOrderStatus.Cancelling },
      new Date('2026-03-09T10:02:00.000Z').getTime(),
    )

    expect(execution.confirmedPartsCount).toBe(0)
  })
})
