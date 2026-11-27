import { type AwaitedOrder, isAwaitingActivityOrder, isAwaitingOpenOrder } from './awaitedOrders'

import type { Activity } from '../api/activity'
import type { OpenOrder } from '../api/openOrders'

const NOW = 1_000_000
const ID = '0xawaited'
const OWNER = '0x00000000000000000000000000000000000000aA'
const TARGET = { owner: OWNER, scope: 'NVDA' }

function awaitedOrder(overrides: Partial<AwaitedOrder> = {}): AwaitedOrder {
  return { id: ID, owner: OWNER, scope: 'NVDA', until: NOW + 1, ...overrides }
}

function order(uid: string, cowShedTwapHash?: string): OpenOrder {
  return {
    uid,
    ...(cowShedTwapHash && { cowShedTwap: { eventId: uid, hash: cowShedTwapHash, cowShedAddress: '0xshed' } }),
  } as OpenOrder
}

function trade(orderUid: string): Activity {
  return { orderUid } as Activity
}

beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(NOW))
afterEach(() => jest.restoreAllMocks())

describe('isAwaitingOpenOrder', () => {
  it('is false without an awaited order', () => {
    expect(isAwaitingOpenOrder(null, TARGET, [])).toBe(false)
  })

  it('is false once the wait is over', () => {
    expect(isAwaitingOpenOrder(awaitedOrder({ until: NOW - 1 }), TARGET, [])).toBe(false)
  })

  it('is true while the orders are not loaded or the order is not listed', () => {
    expect(isAwaitingOpenOrder(awaitedOrder(), TARGET, undefined)).toBe(true)
    expect(isAwaitingOpenOrder(awaitedOrder(), TARGET, [order('0xother')])).toBe(true)
  })

  it('matches the owner in any letter case', () => {
    const owner = '0x00000000000000000000000000000000000000aa'

    expect(isAwaitingOpenOrder(awaitedOrder(), { ...TARGET, owner }, [])).toBe(true)
  })

  it.each([
    ['another asset', { ...TARGET, scope: 'AAPL' }],
    ['another wallet', { ...TARGET, owner: '0x00000000000000000000000000000000000000bB' }],
  ])('is false for the orders of %s', (_, target) => {
    expect(isAwaitingOpenOrder(awaitedOrder(), target, [])).toBe(false)
  })

  it('is false once the order is listed by uid', () => {
    expect(isAwaitingOpenOrder(awaitedOrder(), TARGET, [order(ID)])).toBe(false)
  })

  it('is false once a TWAP is listed by its ComposableCoW hash', () => {
    expect(isAwaitingOpenOrder(awaitedOrder(), TARGET, [order('event-1', ID)])).toBe(false)
  })
})

describe('isAwaitingActivityOrder', () => {
  it('is true until a trade of the order is listed', () => {
    expect(isAwaitingActivityOrder(awaitedOrder(), TARGET, undefined)).toBe(true)
    expect(isAwaitingActivityOrder(awaitedOrder(), TARGET, [trade('0xother')])).toBe(true)
    expect(isAwaitingActivityOrder(awaitedOrder(), TARGET, [trade(ID)])).toBe(false)
  })

  it('is false for another asset, or once the wait is over', () => {
    expect(isAwaitingActivityOrder(awaitedOrder(), { ...TARGET, scope: 'AAPL' }, [])).toBe(false)
    expect(isAwaitingActivityOrder(awaitedOrder({ until: NOW - 1 }), TARGET, [])).toBe(false)
  })
})
