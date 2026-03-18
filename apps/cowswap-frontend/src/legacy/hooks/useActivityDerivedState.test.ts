import { OrderClass } from '@cowprotocol/cow-sdk'

import { ActivityStatus, ActivityType } from 'common/types/activity'

import { getActivityDerivedState } from './useActivityDerivedState'

import { OrderStatus } from '../state/orders/actions'

describe('getActivityDerivedState', () => {
  it('treats a cancelled order with full fill evidence as confirmed', () => {
    const derivedState = getActivityDerivedState({
      chainId: 11155111,
      activityData: {
        id: 'order-1',
        type: ActivityType.ORDER,
        status: ActivityStatus.CANCELLED,
        date: new Date('2026-03-16T12:26:12.000Z'),
        activity: {
          id: 'order-1',
          class: OrderClass.MARKET,
          status: OrderStatus.CANCELLED,
          creationTime: '2026-03-16T12:26:12.000Z',
          kind: 'sell',
          sellAmount: '200000000000000000',
          buyAmount: '19812607050992393275',
          apiAdditionalInfo: {
            executedSellAmount: '200000000000000000',
            executedSellAmountBeforeFees: '200000000000000000',
            executedFeeAmount: '0',
            executedBuyAmount: '19913940357921115960',
          },
        },
      } as never,
    })

    expect(derivedState?.isConfirmed).toBe(true)
    expect(derivedState?.isCancelled).toBe(false)
  })
})
