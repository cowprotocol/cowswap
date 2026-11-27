import { toSparklinePoints } from './sparklinePoints'

describe('toSparklinePoints', () => {
  it('scales the series to the box with y growing downwards', () => {
    expect(
      toSparklinePoints(
        [
          { time: 0, value: 1 },
          { time: 1, value: 3 },
          { time: 2, value: 2 },
        ],
        100,
        20,
      ),
    ).toBe('0,20 50,0 100,10')
  })

  it('draws a flat series in the middle', () => {
    expect(
      toSparklinePoints(
        [
          { time: 0, value: 5 },
          { time: 1, value: 5 },
        ],
        100,
        20,
      ),
    ).toBe('0,10 100,10')
  })

  it('returns null with less than two points', () => {
    expect(toSparklinePoints([{ time: 0, value: 1 }], 100, 20)).toBeNull()
  })
})
