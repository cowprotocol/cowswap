import JSBI from 'jsbi'

import type { Order } from 'legacy/state/orders/actions'

import type { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { getRemainingSellAmountForFillability } from './getRemainingSellAmountForFillability'

describe('getRemainingSellAmountForFillability()', () => {
  it('subtracts executed sell from api order (TWAP parent)', () => {
    const order = {
      sellAmount: '1000',
      apiAdditionalInfo: {
        executedSellAmount: '400',
      },
    } as unknown as Order

    expect(getRemainingSellAmountForFillability(order)).toBe(600n)
  })

  it('uses executionData.executedSellAmount on ParsedOrder', () => {
    const order = {
      sellAmount: '1000',
      executionData: {
        executedSellAmount: JSBI.BigInt(250),
      },
    } as unknown as ParsedOrder

    expect(getRemainingSellAmountForFillability(order)).toBe(750n)
  })

  it('returns total when nothing has executed yet', () => {
    const order = {
      sellAmount: '999',
    } as unknown as Order

    expect(getRemainingSellAmountForFillability(order)).toBe(999n)
  })
})
