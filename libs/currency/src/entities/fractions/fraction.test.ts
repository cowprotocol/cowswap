import JSBI from 'jsbi'

import { Fraction } from './fraction'

import { Rounding } from '../constants'

describe('Fraction — input type compatibility', () => {
  it('accepts number inputs', () => {
    const f = new Fraction(8, 3)
    expect(f.numerator.toString()).toBe('8')
    expect(f.denominator.toString()).toBe('3')
  })

  it('accepts string inputs', () => {
    const f = new Fraction('8', '3')
    expect(f.numerator.toString()).toBe('8')
    expect(f.denominator.toString()).toBe('3')
  })

  it('accepts native bigint inputs', () => {
    const f = new Fraction(8n, 3n)
    expect(f.numerator.toString()).toBe('8')
    expect(f.denominator.toString()).toBe('3')
  })

  it('accepts JSBI inputs', () => {
    const f = new Fraction(JSBI.BigInt(8), JSBI.BigInt(3))
    expect(f.numerator.toString()).toBe('8')
    expect(f.denominator.toString()).toBe('3')
  })

  it('defaults denominator to 1', () => {
    expect(new Fraction(5).denominator.toString()).toBe('1')
  })

  it('number, string and JSBI inputs produce equivalent fractions', () => {
    const fromNumber = new Fraction(8, 3)
    const fromString = new Fraction('8', '3')
    const fromJsbi = new Fraction(JSBI.BigInt(8), JSBI.BigInt(3))
    expect(fromNumber.numerator.toString()).toBe(fromString.numerator.toString())
    expect(fromNumber.numerator.toString()).toBe(fromJsbi.numerator.toString())
  })

  it('native bigint inputs produce equivalent fractions (post-migration)', () => {
    // This test will be red before the JSBI→bigint migration and green after.
    const fromBigint = new Fraction(8n, 3n)
    expect(fromBigint.numerator.toString()).toBe('8')
    expect(fromBigint.denominator.toString()).toBe('3')
  })
})

describe('Fraction — arithmetic with BigintIsh scalars', () => {
  describe('#add with scalar', () => {
    it('adds a number scalar', () => {
      expect(new Fraction(1, 2).add(1).toFixed(1)).toBe('1.5')
    })
    it('adds a string scalar', () => {
      expect(new Fraction(1, 2).add('3').toFixed(1)).toBe('3.5')
    })
    it('adds a native bigint scalar', () => {
      expect(new Fraction(1, 2).add(2n).toFixed(1)).toBe('2.5')
    })
    it('adds a JSBI scalar', () => {
      expect(new Fraction(1, 2).add(JSBI.BigInt(2)).toFixed(1)).toBe('2.5')
    })
  })

  describe('#subtract with scalar', () => {
    it('subtracts a number scalar', () => {
      expect(new Fraction(5, 2).subtract(1).toFixed(1)).toBe('1.5')
    })
    it('subtracts a native bigint scalar', () => {
      expect(new Fraction(5, 2).subtract(2n).toFixed(1)).toBe('0.5')
    })
    it('subtracts a JSBI scalar', () => {
      expect(new Fraction(5, 2).subtract(JSBI.BigInt(1)).toFixed(1)).toBe('1.5')
    })
  })

  describe('#multiply with scalar', () => {
    it('multiplies by a number scalar', () => {
      expect(new Fraction(1, 2).multiply(3).toFixed(1)).toBe('1.5')
    })
    it('multiplies by a native bigint scalar', () => {
      expect(new Fraction(1, 2).multiply(3n).toFixed(1)).toBe('1.5')
    })
    it('multiplies by a JSBI scalar', () => {
      expect(new Fraction(1, 2).multiply(JSBI.BigInt(3)).toFixed(1)).toBe('1.5')
    })
  })

  describe('#divide with scalar', () => {
    it('divides by a number scalar', () => {
      expect(new Fraction(3, 1).divide(2).toFixed(1)).toBe('1.5')
    })
    it('divides by a native bigint scalar', () => {
      expect(new Fraction(3, 1).divide(2n).toFixed(1)).toBe('1.5')
    })
    it('divides by a JSBI scalar', () => {
      expect(new Fraction(3, 1).divide(JSBI.BigInt(2)).toFixed(1)).toBe('1.5')
    })
  })
})

describe('Fraction — core operations (string assertions)', () => {
  describe('#quotient', () => {
    it('floor division', () => {
      expect(new Fraction(8, 3).quotient.toString()).toBe('2')
      expect(new Fraction(12, 4).quotient.toString()).toBe('3')
      expect(new Fraction(16, 5).quotient.toString()).toBe('3')
    })
  })

  describe('#remainder', () => {
    it('returns fraction after division', () => {
      expect(new Fraction(8, 3).remainder.numerator.toString()).toBe('2')
      expect(new Fraction(8, 3).remainder.denominator.toString()).toBe('3')
      expect(new Fraction(12, 4).remainder.numerator.toString()).toBe('0')
      expect(new Fraction(16, 5).remainder.numerator.toString()).toBe('1')
    })
  })

  describe('#invert', () => {
    it('flips num and denom', () => {
      expect(new Fraction(5, 10).invert().numerator.toString()).toBe('10')
      expect(new Fraction(5, 10).invert().denominator.toString()).toBe('5')
    })
  })

  describe('#add', () => {
    it('multiples denoms and adds nums', () => {
      const result = new Fraction(1, 10).add(new Fraction(4, 12))
      expect(result.numerator.toString()).toBe('52')
      expect(result.denominator.toString()).toBe('120')
    })
    it('same denom', () => {
      const result = new Fraction(1, 5).add(new Fraction(2, 5))
      expect(result.numerator.toString()).toBe('3')
      expect(result.denominator.toString()).toBe('5')
    })
  })

  describe('#subtract', () => {
    it('multiples denoms and subtracts nums', () => {
      const result = new Fraction(1, 10).subtract(new Fraction(4, 12))
      expect(result.numerator.toString()).toBe('-28')
      expect(result.denominator.toString()).toBe('120')
    })
    it('same denom', () => {
      const result = new Fraction(3, 5).subtract(new Fraction(2, 5))
      expect(result.numerator.toString()).toBe('1')
      expect(result.denominator.toString()).toBe('5')
    })
  })

  describe('#multiply', () => {
    it('correct', () => {
      expect(new Fraction(1, 10).multiply(new Fraction(4, 12)).numerator.toString()).toBe('4')
      expect(new Fraction(1, 10).multiply(new Fraction(4, 12)).denominator.toString()).toBe('120')
    })
  })

  describe('#divide', () => {
    it('correct', () => {
      expect(new Fraction(1, 10).divide(new Fraction(4, 12)).numerator.toString()).toBe('12')
      expect(new Fraction(1, 10).divide(new Fraction(4, 12)).denominator.toString()).toBe('40')
    })
  })
})

describe('Fraction', () => {
  describe('#quotient', () => {
    it('floor division', () => {
      expect(new Fraction(JSBI.BigInt(8), JSBI.BigInt(3)).quotient).toEqual(2n) // one below
      expect(new Fraction(JSBI.BigInt(12), JSBI.BigInt(4)).quotient).toEqual(3n) // exact
      expect(new Fraction(JSBI.BigInt(16), JSBI.BigInt(5)).quotient).toEqual(3n) // one above
    })
  })
  describe('#remainder', () => {
    it('returns fraction after divison', () => {
      expect(new Fraction(JSBI.BigInt(8), JSBI.BigInt(3)).remainder).toEqual(
        new Fraction(JSBI.BigInt(2), JSBI.BigInt(3)),
      )
      expect(new Fraction(JSBI.BigInt(12), JSBI.BigInt(4)).remainder).toEqual(
        new Fraction(JSBI.BigInt(0), JSBI.BigInt(4)),
      )
      expect(new Fraction(JSBI.BigInt(16), JSBI.BigInt(5)).remainder).toEqual(
        new Fraction(JSBI.BigInt(1), JSBI.BigInt(5)),
      )
    })
  })
  describe('#invert', () => {
    it('flips num and denom', () => {
      expect(new Fraction(JSBI.BigInt(5), JSBI.BigInt(10)).invert().numerator).toEqual(10n)
      expect(new Fraction(JSBI.BigInt(5), JSBI.BigInt(10)).invert().denominator).toEqual(5n)
    })
  })
  describe('#add', () => {
    it('multiples denoms and adds nums', () => {
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(10)).add(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toEqual(
        new Fraction(JSBI.BigInt(52), JSBI.BigInt(120)),
      )
    })

    it('same denom', () => {
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(5)).add(new Fraction(JSBI.BigInt(2), JSBI.BigInt(5)))).toEqual(
        new Fraction(JSBI.BigInt(3), JSBI.BigInt(5)),
      )
    })
  })
  describe('#subtract', () => {
    it('multiples denoms and subtracts nums', () => {
      expect(
        new Fraction(JSBI.BigInt(1), JSBI.BigInt(10)).subtract(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12))),
      ).toEqual(new Fraction(JSBI.BigInt(-28), JSBI.BigInt(120)))
    })
    it('same denom', () => {
      expect(
        new Fraction(JSBI.BigInt(3), JSBI.BigInt(5)).subtract(new Fraction(JSBI.BigInt(2), JSBI.BigInt(5))),
      ).toEqual(new Fraction(JSBI.BigInt(1), JSBI.BigInt(5)))
    })
  })
  describe('#lessThan', () => {
    it('correct', () => {
      expect(
        new Fraction(JSBI.BigInt(1), JSBI.BigInt(10)).lessThan(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12))),
      ).toBe(true)
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(3)).lessThan(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toBe(
        false,
      )
      expect(
        new Fraction(JSBI.BigInt(5), JSBI.BigInt(12)).lessThan(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12))),
      ).toBe(false)
    })
  })
  describe('#equalTo', () => {
    it('correct', () => {
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(10)).equalTo(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toBe(
        false,
      )
      expect(new Fraction(JSBI.BigInt(1), JSBI.BigInt(3)).equalTo(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toBe(
        true,
      )
      expect(new Fraction(JSBI.BigInt(5), JSBI.BigInt(12)).equalTo(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12)))).toBe(
        false,
      )
    })
  })
  describe('#greaterThan', () => {
    it('correct', () => {
      expect(
        new Fraction(JSBI.BigInt(1), JSBI.BigInt(10)).greaterThan(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12))),
      ).toBe(false)
      expect(
        new Fraction(JSBI.BigInt(1), JSBI.BigInt(3)).greaterThan(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12))),
      ).toBe(false)
      expect(
        new Fraction(JSBI.BigInt(5), JSBI.BigInt(12)).greaterThan(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12))),
      ).toBe(true)
    })
  })
  describe('#multiplty', () => {
    it('correct', () => {
      expect(
        new Fraction(JSBI.BigInt(1), JSBI.BigInt(10)).multiply(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12))),
      ).toEqual(new Fraction(JSBI.BigInt(4), JSBI.BigInt(120)))
      expect(
        new Fraction(JSBI.BigInt(1), JSBI.BigInt(3)).multiply(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12))),
      ).toEqual(new Fraction(JSBI.BigInt(4), JSBI.BigInt(36)))
      expect(
        new Fraction(JSBI.BigInt(5), JSBI.BigInt(12)).multiply(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12))),
      ).toEqual(new Fraction(JSBI.BigInt(20), JSBI.BigInt(144)))
    })
  })
  describe('#divide', () => {
    it('correct', () => {
      expect(
        new Fraction(JSBI.BigInt(1), JSBI.BigInt(10)).divide(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12))),
      ).toEqual(new Fraction(JSBI.BigInt(12), JSBI.BigInt(40)))
      expect(
        new Fraction(JSBI.BigInt(1), JSBI.BigInt(3)).divide(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12))),
      ).toEqual(new Fraction(JSBI.BigInt(12), JSBI.BigInt(12)))
      expect(
        new Fraction(JSBI.BigInt(5), JSBI.BigInt(12)).divide(new Fraction(JSBI.BigInt(4), JSBI.BigInt(12))),
      ).toEqual(new Fraction(JSBI.BigInt(60), JSBI.BigInt(48)))
    })
  })
  describe('#asFraction', () => {
    it('returns an equivalent but not the same reference fraction', () => {
      const f = new Fraction(1, 2)
      expect(f.asFraction).toEqual(f)
      expect(f === f.asFraction).toEqual(false)
    })
  })

  describe('#toFixed', () => {
    describe('rounding modes', () => {
      // 1/3 = 0.333333...
      it('ROUND_DOWN truncates without rounding up', () => {
        expect(new Fraction(1, 3).toFixed(4, undefined, Rounding.ROUND_DOWN)).toBe('0.3333')
        expect(new Fraction(2, 3).toFixed(4, undefined, Rounding.ROUND_DOWN)).toBe('0.6666')
        expect(new Fraction(1, 2).toFixed(0, undefined, Rounding.ROUND_DOWN)).toBe('0')
      })

      it('ROUND_HALF_UP rounds half away from zero (default)', () => {
        // 1/3 = 0.3333..., 5th digit is 3 → rounds down
        expect(new Fraction(1, 3).toFixed(4)).toBe('0.3333')
        expect(new Fraction(1, 3).toFixed(4, undefined, Rounding.ROUND_HALF_UP)).toBe('0.3333')
        // 2/3 = 0.6666..., 5th digit is 6 → rounds up
        expect(new Fraction(2, 3).toFixed(4, undefined, Rounding.ROUND_HALF_UP)).toBe('0.6667')
        // 1/2 = 0.5, rounds up to 1
        expect(new Fraction(1, 2).toFixed(0, undefined, Rounding.ROUND_HALF_UP)).toBe('1')
        // 5/4 = 1.25, 2nd digit is 5 → rounds up
        expect(new Fraction(5, 4).toFixed(1, undefined, Rounding.ROUND_HALF_UP)).toBe('1.3')
      })

      it('ROUND_UP rounds away from zero for any non-zero remainder', () => {
        // 1/3 = 0.3333..., any digit beyond → rounds up
        expect(new Fraction(1, 3).toFixed(4, undefined, Rounding.ROUND_UP)).toBe('0.3334')
        expect(new Fraction(2, 3).toFixed(4, undefined, Rounding.ROUND_UP)).toBe('0.6667')
        // 1.1 rounds up to 2 at 0 decimal places
        expect(new Fraction(11, 10).toFixed(0, undefined, Rounding.ROUND_UP)).toBe('2')
        // exact value is unaffected
        expect(new Fraction(1, 2).toFixed(1, undefined, Rounding.ROUND_UP)).toBe('0.5')
      })

      it('exact values are unaffected by rounding mode', () => {
        expect(new Fraction(1, 4).toFixed(2, undefined, Rounding.ROUND_DOWN)).toBe('0.25')
        expect(new Fraction(1, 4).toFixed(2, undefined, Rounding.ROUND_HALF_UP)).toBe('0.25')
        expect(new Fraction(1, 4).toFixed(2, undefined, Rounding.ROUND_UP)).toBe('0.25')
      })
    })

    describe('decimal places', () => {
      it('zero decimal places', () => {
        expect(new Fraction(7, 2).toFixed(0)).toBe('4')
        expect(new Fraction(3, 1).toFixed(0)).toBe('3')
      })

      it('pads with zeros when needed', () => {
        expect(new Fraction(1, 2).toFixed(4)).toBe('0.5000')
        expect(new Fraction(1, 1).toFixed(3)).toBe('1.000')
      })
    })

    describe('format options', () => {
      it('uses comma as group separator', () => {
        expect(new Fraction(1000000, 1).toFixed(2, { groupSeparator: ',' })).toBe('1,000,000.00')
        expect(new Fraction(1234567, 1).toFixed(0, { groupSeparator: ',' })).toBe('1,234,567')
      })

      it('uses space as group separator', () => {
        expect(new Fraction(1000000, 1).toFixed(0, { groupSeparator: ' ' })).toBe('1 000 000')
      })

      it('uses no group separator by default', () => {
        expect(new Fraction(1000000, 1).toFixed(2)).toBe('1000000.00')
      })

      it('uses custom decimal separator', () => {
        expect(new Fraction(1, 2).toFixed(2, { decimalSeparator: ',' })).toBe('0,50')
        expect(new Fraction(5, 4).toFixed(2, { decimalSeparator: ',' })).toBe('1,25')
      })

      it('combines group and decimal separators', () => {
        expect(new Fraction(1234567, 100).toFixed(2, { groupSeparator: '.', decimalSeparator: ',' })).toBe('12.345,67')
      })
    })

    describe('validation', () => {
      it('throws for non-integer decimal places', () => {
        expect(() => new Fraction(1, 2).toFixed(1.5)).toThrow('1.5 is not an integer.')
      })

      it('throws for negative decimal places', () => {
        expect(() => new Fraction(1, 2).toFixed(-1)).toThrow('-1 is negative.')
      })
    })

    describe('scientific notation', () => {
      it('does not use scientific notation for very small values', () => {
        // 1 / 10^18 = 1e-18
        expect(new Fraction(1, 10 ** 18).toFixed(18)).toBe('0.000000000000000001')
        // 25000 / 10^18 = 2.5e-14
        expect(new Fraction(25000, 10 ** 18).toFixed(15)).toBe('0.000000000000025')
      })
    })
  })

  describe('#toSignificant', () => {
    describe('rounding modes', () => {
      // 1/3 = 0.333333...
      it('ROUND_DOWN truncates significant digits', () => {
        expect(new Fraction(1, 3).toSignificant(4, undefined, Rounding.ROUND_DOWN)).toBe('0.3333')
        expect(new Fraction(2, 3).toSignificant(4, undefined, Rounding.ROUND_DOWN)).toBe('0.6666')
        expect(new Fraction(2, 3).toSignificant(1, undefined, Rounding.ROUND_DOWN)).toBe('0.6')
      })

      it('ROUND_HALF_UP rounds half away from zero (default)', () => {
        // 1/3 = 0.3333..., next digit is 3 → down
        expect(new Fraction(1, 3).toSignificant(4)).toBe('0.3333')
        expect(new Fraction(1, 3).toSignificant(4, undefined, Rounding.ROUND_HALF_UP)).toBe('0.3333')
        // 2/3 = 0.6666..., next digit is 6 → up
        expect(new Fraction(2, 3).toSignificant(4, undefined, Rounding.ROUND_HALF_UP)).toBe('0.6667')
        // 5/9 = 0.5555..., next digit is 5 → up
        expect(new Fraction(5, 9).toSignificant(3, undefined, Rounding.ROUND_HALF_UP)).toBe('0.556')
      })

      it('ROUND_UP rounds away from zero for any non-zero remainder', () => {
        expect(new Fraction(1, 3).toSignificant(4, undefined, Rounding.ROUND_UP)).toBe('0.3334')
        expect(new Fraction(2, 3).toSignificant(4, undefined, Rounding.ROUND_UP)).toBe('0.6667')
        expect(new Fraction(2, 3).toSignificant(1, undefined, Rounding.ROUND_UP)).toBe('0.7')
      })

      it('exact values are unaffected by rounding mode', () => {
        expect(new Fraction(1, 4).toSignificant(3, undefined, Rounding.ROUND_DOWN)).toBe('0.25')
        expect(new Fraction(1, 4).toSignificant(3, undefined, Rounding.ROUND_HALF_UP)).toBe('0.25')
        expect(new Fraction(1, 4).toSignificant(3, undefined, Rounding.ROUND_UP)).toBe('0.25')
      })
    })

    describe('significant digits', () => {
      it('returns correct number of significant digits', () => {
        expect(new Fraction(1, 2).toSignificant(1)).toBe('0.5')
        // toSignificant does not pad trailing zeros beyond natural precision
        expect(new Fraction(1, 2).toSignificant(3)).toBe('0.5')
        expect(new Fraction(12345, 10).toSignificant(5)).toBe('1234.5')
        // repeating decimals use all significant digit positions
        expect(new Fraction(1, 3).toSignificant(3)).toBe('0.333')
      })

      it('handles integers', () => {
        expect(new Fraction(12345, 1).toSignificant(3, undefined, Rounding.ROUND_DOWN)).toBe('12300')
      })
    })

    describe('format options', () => {
      it('uses comma as group separator', () => {
        // 12345/10 = 1234.5, 5 sig figs, grouping on thousands
        expect(new Fraction(12345, 10).toSignificant(5, { groupSeparator: ',' })).toBe('1,234.5')
      })

      it('uses no group separator by default', () => {
        expect(new Fraction(12345, 10).toSignificant(5)).toBe('1234.5')
      })

      it('uses space as group separator', () => {
        expect(new Fraction(1234567, 1).toSignificant(7, { groupSeparator: ' ' })).toBe('1 234 567')
      })
    })

    describe('validation', () => {
      it('throws for non-integer significant digits', () => {
        expect(() => new Fraction(1, 2).toSignificant(1.5)).toThrow('1.5 is not an integer.')
      })

      it('throws for zero significant digits', () => {
        expect(() => new Fraction(1, 2).toSignificant(0)).toThrow('0 is not positive.')
      })

      it('throws for negative significant digits', () => {
        expect(() => new Fraction(1, 2).toSignificant(-1)).toThrow('-1 is not positive.')
      })
    })

    describe('scientific notation', () => {
      it('does not use scientific notation for very small values', () => {
        // 1 / 10^18 = 1e-18
        expect(new Fraction(1, 10 ** 18).toSignificant(1)).toBe('0.000000000000000001')
        // 25000 / 10^18 = 2.5e-14
        expect(new Fraction(25000, 10 ** 18).toSignificant(2)).toBe('0.000000000000025')
      })
    })

    describe('negative fractions', () => {
      it('handles negative numerator', () => {
        expect(new Fraction(-1, 3).toSignificant(4)).toBe('-0.3333')
        expect(new Fraction(-2, 3).toSignificant(4, undefined, Rounding.ROUND_DOWN)).toBe('-0.6666')
        expect(new Fraction(-2, 3).toSignificant(4, undefined, Rounding.ROUND_UP)).toBe('-0.6667')
      })

      it('handles negative denominator', () => {
        expect(new Fraction(1, -3).toSignificant(4)).toBe('-0.3333')
      })
    })

    describe('zero', () => {
      it('returns "0" for zero numerator', () => {
        expect(new Fraction(0, 1).toSignificant(5)).toBe('0')
        expect(new Fraction(0, 100).toSignificant(1)).toBe('0')
      })
    })
  })

  describe('#toJSON', () => {
    it('emits numerator and denominator as decimal strings', () => {
      expect(new Fraction(8n, 3n).toJSON()).toEqual({ numerator: '8', denominator: '3' })
    })

    it('is invoked automatically by JSON.stringify (does not throw on bigint)', () => {
      const f = new Fraction(8n, 3n)
      // Without toJSON, JSON.stringify on a bigint field throws "Do not know how to serialize a BigInt".
      const json = JSON.stringify(f)
      expect(JSON.parse(json)).toEqual({ numerator: '8', denominator: '3' })
    })

    it('round-trips through JSON.stringify / JSON.parse / new Fraction', () => {
      const original = new Fraction(8n, 3n)
      const parsed = JSON.parse(JSON.stringify(original)) as { numerator: string; denominator: string }
      const restored = new Fraction(parsed.numerator, parsed.denominator)
      expect(restored.equalTo(original)).toBe(true)
    })

    it('preserves precision for values beyond Number.MAX_SAFE_INTEGER', () => {
      const big = 12345678901234567890123456789n
      const f = new Fraction(big, 1n)
      expect(f.toJSON().numerator).toBe(big.toString())
      const roundTripped = new Fraction(
        JSON.parse(JSON.stringify(f)).numerator,
        JSON.parse(JSON.stringify(f)).denominator,
      )
      expect(roundTripped.numerator).toBe(big)
    })
  })
})
