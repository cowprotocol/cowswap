import { CurrencyAmount } from './currencyAmount'
import { Price } from './price'

import { Token } from '../token'

describe('Price', () => {
  const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
  const ADDRESS_ONE = '0x0000000000000000000000000000000000000001'

  const t0 = new Token(1, ADDRESS_ZERO, 18)
  const t0_6 = new Token(1, ADDRESS_ZERO, 6)
  const t1 = new Token(1, ADDRESS_ONE, 18)

  describe('#constructor', () => {
    it('array format works', () => {
      const price = new Price(t0, t1, 1, 54321)
      expect(price.toSignificant(5)).toEqual('54321')
      expect(price.baseCurrency.equals(t0)).toBe(true)
      expect(price.quoteCurrency.equals(t1)).toBe(true)
    })
    it('object format works', () => {
      const price = new Price({
        baseAmount: CurrencyAmount.fromRawAmount(t0, 1),
        quoteAmount: CurrencyAmount.fromRawAmount(t1, 54321),
      })
      expect(price.toSignificant(5)).toEqual('54321')
      expect(price.baseCurrency.equals(t0)).toBe(true)
      expect(price.quoteCurrency.equals(t1)).toBe(true)
    })
  })

  describe('#quote', () => {
    it('returns correct value', () => {
      const price = new Price(t0, t1, 1, 5)
      expect(price.quote(CurrencyAmount.fromRawAmount(t0, 10))).toEqual(CurrencyAmount.fromRawAmount(t1, 50))
    })
  })

  describe('#toSignificant', () => {
    it('no decimals', () => {
      const p = new Price(t0, t1, 123, 456)
      expect(p.toSignificant(4)).toEqual('3.707')
    })
    it('no decimals flip ratio', () => {
      const p = new Price(t0, t1, 456, 123)
      expect(p.toSignificant(4)).toEqual('0.2697')
    })
    it('with decimal difference', () => {
      const p = new Price(t0_6, t1, 123, 456)
      expect(p.toSignificant(4)).toEqual('0.000000000003707')
    })
    it('with decimal difference flipped', () => {
      const p = new Price(t0_6, t1, 456, 123)
      expect(p.toSignificant(4)).toEqual('0.0000000000002697')
    })
    it('with decimal difference flipped base quote flipped', () => {
      const p = new Price(t1, t0_6, 456, 123)
      expect(p.toSignificant(4)).toEqual('269700000000')
    })
  })

  describe('#toJSON', () => {
    it('includes numerator, denominator, baseCurrency, and quoteCurrency', () => {
      const p = new Price(t0, t1, 123, 456)
      const json = p.toJSON()
      expect(json.numerator).toBe('456')
      expect(json.denominator).toBe('123')
      expect(json.baseCurrency).toBe(t0)
      expect(json.quoteCurrency).toBe(t1)
    })

    it('JSON.stringify produces a plain object (no bigint throw)', () => {
      const p = new Price(t0, t1, 123, 456)
      const parsed = JSON.parse(JSON.stringify(p))
      expect(parsed.numerator).toBe('456')
      expect(parsed.denominator).toBe('123')
      expect(parsed.baseCurrency.address).toBe(t0.address)
      expect(parsed.quoteCurrency.address).toBe(t1.address)
    })

    it('round-trips through JSON producing an equivalent price', () => {
      const original = new Price(t0_6, t1, 123, 456)
      const parsed = JSON.parse(JSON.stringify(original)) as {
        numerator: string
        denominator: string
        baseCurrency: { chainId: number; address: string; decimals: number }
        quoteCurrency: { chainId: number; address: string; decimals: number }
      }
      const baseRestored = new Token(
        parsed.baseCurrency.chainId,
        parsed.baseCurrency.address,
        parsed.baseCurrency.decimals,
      )
      const quoteRestored = new Token(
        parsed.quoteCurrency.chainId,
        parsed.quoteCurrency.address,
        parsed.quoteCurrency.decimals,
      )
      const restored = new Price(baseRestored, quoteRestored, parsed.denominator, parsed.numerator)
      expect(restored.toSignificant(4)).toBe(original.toSignificant(4))
    })
  })
})
