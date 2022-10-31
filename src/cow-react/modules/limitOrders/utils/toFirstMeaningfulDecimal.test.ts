import { toFirstMeaningfulDecimal } from './toFirstMeaningfulDecimal'
import { Fraction } from '@uniswap/sdk-core'

describe('toFirstMeaningfulDecimal()', () => {
  it('When the result decimals length is under limit, then should return the value with limited decimals', () => {
    const fraction = new Fraction('100000000000000000000', '61791470693198824')
    const result = toFirstMeaningfulDecimal(fraction, 6)

    expect(result).toBe('1618.346332')
  })

  it('When the result is integer, then should return the exact value', () => {
    const fraction = new Fraction('100000000000000000000', '100000000000000000000')
    const result = toFirstMeaningfulDecimal(fraction, 6)

    expect(result).toBe('1')
  })

  it('When the result decimals length is above limit, then should return the value with decimals until first meaningful digit', () => {
    const fraction = new Fraction('617914706900000', '10000000000000000000000')
    const result = toFirstMeaningfulDecimal(fraction, 6)

    expect(result).toBe('0.00000006')
  })
})
