import { divideToDecimalString } from './divideToDecimalString'

describe('divideToDecimalString', () => {
  it('divides evenly', () => {
    expect(divideToDecimalString(1n, 2n, 2)).toBe('0.500')
  })

  it('handles integer result with no remainder', () => {
    expect(divideToDecimalString(6n, 3n, 2)).toBe('2.000')
  })

  it('handles negative numerator', () => {
    expect(divideToDecimalString(-1n, 4n, 2)).toBe('-0.250')
  })

  it('handles negative denominator', () => {
    expect(divideToDecimalString(1n, -4n, 2)).toBe('-0.250')
  })

  it('both negative = positive', () => {
    expect(divideToDecimalString(-1n, -4n, 2)).toBe('0.250')
  })

  it('produces extraDigits + 1 fractional digits', () => {
    // 1/3 = 0.3333... with extraDigits=4 → 5 frac digits
    const result = divideToDecimalString(1n, 3n, 4)
    expect(result.split('.')[1]).toHaveLength(5)
  })

  it('repeating decimal produces correct digits', () => {
    const result = divideToDecimalString(1n, 3n, 5)
    expect(result).toBe('0.333333')
  })

  it('handles zero numerator', () => {
    expect(divideToDecimalString(0n, 7n, 3)).toBe('0.0000')
  })

  it('handles large token amounts (18 decimals scale)', () => {
    const one = 1_000_000_000_000_000_000n // 1e18
    const result = divideToDecimalString(one, one, 2)
    expect(result).toBe('1.000')
  })

  it('handles numerator larger than denominator', () => {
    const result = divideToDecimalString(7n, 2n, 2)
    expect(result).toBe('3.500')
  })
})
