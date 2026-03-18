import { OrderClass } from '@cowprotocol/cow-sdk'

import { ActivityStatus } from 'common/types/activity'

import { createActivityDescriptor } from './useRecentActivity'

import { OrderStatus } from '../state/orders/actions'

describe('createActivityDescriptor', () => {
  it('treats a cancelled order with full fill evidence as confirmed', () => {
    const descriptor = createActivityDescriptor(undefined, {
      id: 'order-1',
      status: OrderStatus.CANCELLED,
      creationTime: '2026-03-16T12:14:00.000Z',
      kind: 'sell',
      sellAmount: '1000000000000000000',
      buyAmount: '1000',
      apiAdditionalInfo: {
        executedSellAmount: '1000000000000000000',
        executedSellAmountBeforeFees: '1000000000000000000',
        executedFeeAmount: '0',
        executedBuyAmount: '1010',
      },
    } as never)

    expect(descriptor?.status).toBe(ActivityStatus.CONFIRMED)
  })

  it('keeps a genuinely cancelled order cancelled when there is no fill evidence', () => {
    const descriptor = createActivityDescriptor(undefined, {
      id: 'order-2',
      class: OrderClass.MARKET,
      status: OrderStatus.CANCELLED,
      creationTime: '2026-03-16T12:14:00.000Z',
      kind: 'sell',
      sellAmount: '1000000000000000000',
      buyAmount: '1000',
      apiAdditionalInfo: {
        executedSellAmount: '0',
        executedSellAmountBeforeFees: '0',
        executedFeeAmount: '0',
        executedBuyAmount: '0',
      },
    } as never)

    expect(descriptor?.status).toBe(ActivityStatus.CANCELLED)
  })
})
