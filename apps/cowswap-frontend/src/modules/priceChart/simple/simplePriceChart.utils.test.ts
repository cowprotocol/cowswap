import { getCandlePriceFormat } from './simplePriceChart.utils'

describe('getCandlePriceFormat', () => {
  it.each([
    [0.109, 4, 0.0001],
    [0.00001456, 8, 0.00000001],
    [1_916, 2, 0.01],
  ])('uses enough precision for %s', (price, precision, minMove) => {
    const bar = { close: price, high: price, low: price, open: price, timestamp: 1 }

    expect(getCandlePriceFormat([bar])).toEqual({ minMove, precision, type: 'price' })
  })
})
