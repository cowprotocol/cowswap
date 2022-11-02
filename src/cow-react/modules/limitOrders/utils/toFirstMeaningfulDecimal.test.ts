import { toFirstMeaningfulDecimal } from './toFirstMeaningfulDecimal'

describe('toFirstMeaningfulDecimal()', () => {
  it('When the result decimals length is under limit, then should return the value with limited decimals', () => {
    const result = toFirstMeaningfulDecimal('1618.34633288646839472159', 6)

    expect(result).toBe('1618.346332')
  })

  it('When the result is integer, then should return the exact value', () => {
    const result = toFirstMeaningfulDecimal('1.00000000000000000000', 6)

    expect(result).toBe('1')
  })

  it('When the result decimals length is above limit, then should return the value with decimals until first meaningful digit', () => {
    const result = toFirstMeaningfulDecimal('0.00000006179147069000', 6)

    expect(result).toBe('0.00000006')
  })
})
