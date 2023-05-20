import { trimTrailingZeros } from './trimTrailingZeros'

describe('trimTrailingZeros', () => {
  it('0', () => {
    const result = trimTrailingZeros('0')

    expect(result).toBe('0')
  })

  it('0.0', () => {
    const result = trimTrailingZeros('0.0')

    expect(result).toBe('0')
  })

  it('0.00', () => {
    const result = trimTrailingZeros('0.00')

    expect(result).toBe('0')
  })

  it('0.10', () => {
    const result = trimTrailingZeros('0.10')

    expect(result).toBe('0.1')
  })
})
