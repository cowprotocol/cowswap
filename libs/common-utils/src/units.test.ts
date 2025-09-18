import { formatUnitsSafe } from './units'

describe('formatUnitsSafe', () => {
  it('returns empty string for nullish inputs', () => {
    expect(formatUnitsSafe(undefined, 18)).toBe('')
    expect(formatUnitsSafe(null, 6)).toBe('')
  })

  it('formats integer inputs across types', () => {
    expect(formatUnitsSafe('123400', 4)).toBe('12.34')
    expect(formatUnitsSafe(123400, 4)).toBe('12.34')
    expect(formatUnitsSafe(123400n, 4)).toBe('12.34')
  })

  it('drops trailing zeros on fractional part', () => {
    expect(formatUnitsSafe('1000', 3)).toBe('1')
    expect(formatUnitsSafe('1001000', 6)).toBe('1.001')
  })

  it('handles negative values', () => {
    expect(formatUnitsSafe('-123400', 4)).toBe('-12.34')
  })

  it('throws on invalid numeric strings', () => {
    expect(() => formatUnitsSafe('12.3', 2)).toThrow(/integer-like string/)
    expect(() => formatUnitsSafe('abc', 2)).toThrow(/integer-like string/)
  })

  it('throws on invalid decimals', () => {
    expect(() => formatUnitsSafe('100', -1)).toThrow(/non-negative integer/)
    expect(() => formatUnitsSafe('100', 1.2)).toThrow(/non-negative integer/)
  })
})

