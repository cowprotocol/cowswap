import { applyFormat, stripTrailingZeros } from './applyFormat'

describe('applyFormat', () => {
  describe('no format options', () => {
    it('returns value unchanged', () => {
      expect(applyFormat('1234567')).toBe('1234567')
      expect(applyFormat('1234.56')).toBe('1234.56')
      expect(applyFormat('0.5')).toBe('0.5')
    })
  })

  describe('groupSeparator', () => {
    it('adds comma group separator', () => {
      expect(applyFormat('1000', { groupSeparator: ',' })).toBe('1,000')
      expect(applyFormat('1000000', { groupSeparator: ',' })).toBe('1,000,000')
      expect(applyFormat('1234567', { groupSeparator: ',' })).toBe('1,234,567')
    })

    it('adds space group separator', () => {
      expect(applyFormat('1000000', { groupSeparator: ' ' })).toBe('1 000 000')
    })

    it('does not affect values under 1000', () => {
      expect(applyFormat('999', { groupSeparator: ',' })).toBe('999')
      expect(applyFormat('1', { groupSeparator: ',' })).toBe('1')
    })

    it('applies to integer part only, not fractional', () => {
      expect(applyFormat('1234567.891', { groupSeparator: ',' })).toBe('1,234,567.891')
    })

    it('handles negative numbers', () => {
      expect(applyFormat('-1000000', { groupSeparator: ',' })).toBe('-1,000,000')
    })
  })

  describe('decimalSeparator', () => {
    it('replaces decimal separator', () => {
      expect(applyFormat('0.50', { decimalSeparator: ',' })).toBe('0,50')
      expect(applyFormat('1.25', { decimalSeparator: ',' })).toBe('1,25')
    })

    it('does not affect values without a decimal part', () => {
      expect(applyFormat('1000', { decimalSeparator: ',' })).toBe('1000')
    })
  })

  describe('combined separators', () => {
    it('applies both group and decimal separators', () => {
      expect(applyFormat('12345.67', { groupSeparator: '.', decimalSeparator: ',' })).toBe('12.345,67')
      expect(applyFormat('1234567.89', { groupSeparator: ',', decimalSeparator: '.' })).toBe('1,234,567.89')
    })
  })
})

describe('stripTrailingZeros', () => {
  it('removes trailing zeros after decimal', () => {
    expect(stripTrailingZeros('0.500')).toBe('0.5')
    expect(stripTrailingZeros('1.2300')).toBe('1.23')
  })

  it('removes the dot when all fractional digits are zeros', () => {
    expect(stripTrailingZeros('1.000')).toBe('1')
    expect(stripTrailingZeros('0.0')).toBe('0')
  })

  it('leaves values without trailing zeros unchanged', () => {
    expect(stripTrailingZeros('0.5')).toBe('0.5')
    expect(stripTrailingZeros('1.23')).toBe('1.23')
  })

  it('leaves integers unchanged', () => {
    expect(stripTrailingZeros('12300')).toBe('12300')
    expect(stripTrailingZeros('1')).toBe('1')
  })
})
