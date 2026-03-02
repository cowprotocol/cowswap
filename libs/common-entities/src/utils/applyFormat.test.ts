import { applyFormat } from './applyFormat'

describe('applyFormat', () => {
  describe('groupSeparator', () => {
    it('applies no separator when empty string', () => {
      expect(applyFormat('1234567.89', { groupSeparator: '' })).toBe('1234567.89')
    })

    it('applies comma as group separator', () => {
      expect(applyFormat('1234567.89', { groupSeparator: ',' })).toBe('1,234,567.89')
    })

    it('applies space as group separator', () => {
      expect(applyFormat('1234567', { groupSeparator: ' ' })).toBe('1 234 567')
    })

    it('does not add separator for numbers < 1000', () => {
      expect(applyFormat('999.99', { groupSeparator: ',' })).toBe('999.99')
    })
  })

  describe('decimalSeparator', () => {
    it('uses dot by default', () => {
      expect(applyFormat('1.23', {})).toBe('1.23')
    })

    it('applies custom decimal separator', () => {
      expect(applyFormat('1234.56', { groupSeparator: '.', decimalSeparator: ',' })).toBe('1.234,56')
    })
  })

  describe('no fractional part', () => {
    it('handles integer strings', () => {
      expect(applyFormat('1234', { groupSeparator: ',' })).toBe('1,234')
    })
  })

  describe('negative values', () => {
    it('preserves negative sign', () => {
      expect(applyFormat('-1234567.89', { groupSeparator: ',' })).toBe('-1,234,567.89')
    })

    it('handles negative integer', () => {
      expect(applyFormat('-1000', { groupSeparator: ',' })).toBe('-1,000')
    })
  })

  describe('values < 1', () => {
    it('does not add group separators to fractional part', () => {
      expect(applyFormat('0.00123', { groupSeparator: ',' })).toBe('0.00123')
    })
  })
})
