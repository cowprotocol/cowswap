import { getIntOrFloat } from './getIntOrFloat'

describe('#getIntOrFloat', () => {
  it('returns valid decimals unchanged', () => {
    const valid = ['5', '5.4', '1.', '.12', '0.333', '0', '100', '12.5', '.5', '1.0']

    valid.forEach((amount) => {
      expect(getIntOrFloat(amount)).toEqual(amount)
    })
  })

  it('returns null for malformed input', () => {
    const malformed = ['1e5', '0x10', '  5', '1.2.3', 'abc12', '-5', '12,5', '+5', 'foo.99', '1.2.3.4']

    malformed.forEach((amount) => {
      expect(getIntOrFloat(amount)).toBeNull()
    })
  })

  it('returns null for the empty string', () => {
    expect(getIntOrFloat('')).toBeNull()
  })
})
