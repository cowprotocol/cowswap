import { isAwaitingOpenOrder } from './awaitedOpenOrder'

import type { OpenOrder } from '../api/openOrders'

const NOW = 1_000_000
const ID = '0xawaited'

function order(uid: string, cowShedTwapHash?: string): OpenOrder {
  return {
    uid,
    ...(cowShedTwapHash && { cowShedTwap: { eventId: uid, hash: cowShedTwapHash, cowShedAddress: '0xshed' } }),
  } as OpenOrder
}

describe('isAwaitingOpenOrder', () => {
  beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(NOW))
  afterEach(() => jest.restoreAllMocks())

  it('is false without an awaited order', () => {
    expect(isAwaitingOpenOrder(null, [])).toBe(false)
  })

  it('is false once the wait is over', () => {
    expect(isAwaitingOpenOrder({ id: ID, until: NOW - 1 }, [])).toBe(false)
  })

  it('is true while the orders are not loaded or the order is not listed', () => {
    const awaited = { id: ID, until: NOW + 1 }

    expect(isAwaitingOpenOrder(awaited, undefined)).toBe(true)
    expect(isAwaitingOpenOrder(awaited, [order('0xother')])).toBe(true)
  })

  it('is false once the order is listed by uid', () => {
    expect(isAwaitingOpenOrder({ id: ID, until: NOW + 1 }, [order(ID)])).toBe(false)
  })

  it('is false once a TWAP is listed by its ComposableCoW hash', () => {
    expect(isAwaitingOpenOrder({ id: ID, until: NOW + 1 }, [order('event-1', ID)])).toBe(false)
  })
})
