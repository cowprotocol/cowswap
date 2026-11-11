import { priceRangeWithReferenceLines } from './priceChartSimpleReferenceLines.utils'

describe('priceRangeWithReferenceLines', () => {
  const usdcMin = 0.99967188387
  const usdcMax = 0.999838679136

  it('keeps a limit line that sits on the series', () => {
    expect(priceRangeWithReferenceLines(usdcMin, usdcMax, [0.9994867921508211])).toEqual({
      maxValue: usdcMax,
      minValue: 0.9994867921508211,
    })
  })

  it('does not let a distant line flatten a tight series', () => {
    expect(priceRangeWithReferenceLines(usdcMin, usdcMax, [2.441847733105218])).toEqual({
      maxValue: usdcMax,
      minValue: usdcMin,
    })
  })

  it('keeps a line just outside a wider series', () => {
    expect(priceRangeWithReferenceLines(2085.2203775972134, 2239.675134182134, [1904.4154690512119])).toEqual({
      maxValue: 2239.675134182134,
      minValue: 1904.4154690512119,
    })
  })

  it('leaves a flat series unchanged', () => {
    expect(priceRangeWithReferenceLines(1, 1, [0.9])).toEqual({ maxValue: 1, minValue: 1 })
  })
})
