import { normalizePastedAmount } from './pastedAmount.utils'

describe('normalizePastedAmount', () => {
  it('drops thousands separators when a dot is the decimal point', () => {
    expect(normalizePastedAmount('1,000.25')).toBe('1000.25')
    expect(normalizePastedAmount('1,234,567.891')).toBe('1234567.891')
  })

  it('drops thousands separators when a comma is the decimal point', () => {
    expect(normalizePastedAmount('1.000,25')).toBe('1000.25')
    expect(normalizePastedAmount('1.234.567,891')).toBe('1234567.891')
  })

  it('treats a repeated separator as grouping', () => {
    expect(normalizePastedAmount('1,000,000')).toBe('1000000')
    expect(normalizePastedAmount('1.000.000')).toBe('1000000')
  })

  it('keeps a single separator as the decimal point', () => {
    expect(normalizePastedAmount('1.5')).toBe('1.5')
    expect(normalizePastedAmount('1,5')).toBe('1.5')
    expect(normalizePastedAmount('.5')).toBe('.5')
  })

  it('drops spaces, currency symbols and a trailing separator', () => {
    expect(normalizePastedAmount(' 1 000,25 € ')).toBe('1000.25')
    expect(normalizePastedAmount('$1,000.')).toBe('1000')
    expect(normalizePastedAmount('42 USDC')).toBe('42')
  })

  it('ignores a trailing separator after an amount that already has a decimal part', () => {
    expect(normalizePastedAmount('1,000.25.')).toBe('1000.25')
    expect(normalizePastedAmount('1.000,25,')).toBe('1000.25')
    expect(normalizePastedAmount('1,5,')).toBe('1.5')
  })

  it('reads a trailing separator as the decimal point of a grouped amount', () => {
    expect(normalizePastedAmount('1.000,')).toBe('1000')
    expect(normalizePastedAmount('1,000,000.')).toBe('1000000')
  })

  it('returns an empty string when nothing numeric is pasted', () => {
    expect(normalizePastedAmount('abc')).toBe('')
  })
})
