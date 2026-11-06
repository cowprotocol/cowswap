import type { TwapOrder } from '@cowprotocol/sdk-composable'

import { findTwapPart } from './twapPart'

const OWNER = '0x0000000000000000000000000000000000000c0e'
const SELL_TOKEN = '0x0000000000000000000000000000000000000001'
const BUY_TOKEN = '0x0000000000000000000000000000000000000002'
const START = 1_790_000_000
const INTERVAL = 3600

function part(validTo: number, overrides: Record<string, string> = {}): Parameters<typeof findTwapPart>[0] {
  return { owner: OWNER, sellToken: SELL_TOKEN, buyToken: BUY_TOKEN, sellAmount: '100', validTo, ...overrides }
}

function twap(schedule: Partial<TwapOrder['schedule']> = {}): TwapOrder {
  return {
    owner: OWNER,
    schedule: {
      sellToken: SELL_TOKEN,
      buyToken: BUY_TOKEN,
      partSellAmount: 100n,
      effectiveStartTime: START,
      timeBetweenParts: INTERVAL,
      numberOfParts: 4,
      durationOfPart: 0,
      ...schedule,
    },
  } as TwapOrder
}

describe('findTwapPart', () => {
  it('numbers the parts by their expiry', () => {
    expect(findTwapPart(part(START + INTERVAL - 1), [twap()])).toEqual({ number: 1, count: 4 })
    expect(findTwapPart(part(START + 4 * INTERVAL - 1), [twap()])).toEqual({ number: 4, count: 4 })
  })

  it('numbers a part that is valid for less than the interval', () => {
    expect(findTwapPart(part(START + 2 * INTERVAL + 600 - 1), [twap({ durationOfPart: 600 })])).toEqual({
      number: 3,
      count: 4,
    })
  })

  it('matches addresses in any case', () => {
    const order = part(START + INTERVAL - 1, { owner: OWNER.toUpperCase().replace('0X', '0x') })

    expect(findTwapPart(order, [twap()])).toEqual({ number: 1, count: 4 })
  })

  it('skips the TWAPs with another owner, token or part amount', () => {
    const order = part(START + INTERVAL - 1)

    expect(findTwapPart({ ...order, owner: SELL_TOKEN }, [twap()])).toBe(null)
    expect(findTwapPart({ ...order, buyToken: SELL_TOKEN }, [twap()])).toBe(null)
    expect(findTwapPart({ ...order, sellAmount: '99' }, [twap()])).toBe(null)
  })

  it('skips the TWAPs whose schedule does not cover the expiry', () => {
    expect(findTwapPart(part(START - 1), [twap()])).toBe(null)
    expect(findTwapPart(part(START + 4 * INTERVAL), [twap()])).toBe(null)
  })

  it('picks the TWAP whose schedule covers the expiry', () => {
    const later = twap({ effectiveStartTime: START + 10 * INTERVAL, numberOfParts: 2 })

    expect(findTwapPart(part(START + 11 * INTERVAL - 1), [twap(), later])).toEqual({ number: 1, count: 2 })
  })
})
