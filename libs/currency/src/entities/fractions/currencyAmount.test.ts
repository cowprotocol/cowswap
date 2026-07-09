import { ALL_SUPPORTED_CHAINS_MAP, MAX_UINT256, SupportedChainId } from '@cowprotocol/cow-sdk'

import JSBI from 'jsbi'

import { CurrencyAmount } from './currencyAmount'
import { Fraction } from './fraction'
import { Percent } from './percent'

import { Currency } from '../currency'
import { NativeCurrency } from '../nativeCurrency'
import { Token } from '../token'

// Keep MaxUint256 as JSBI to test backward-compat input (JSBI is still accepted as input)
const MaxUint256Jsbi = JSBI.BigInt(MAX_UINT256.toString())

class TestNativeCurrency extends NativeCurrency {
  constructor(chainId: number) {
    const { decimals, symbol, name } = ALL_SUPPORTED_CHAINS_MAP[chainId as SupportedChainId].nativeCurrency
    super(chainId, decimals, symbol, name)
  }
  override get wrapped(): Token {
    throw new Error('not implemented')
  }
  override equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }
}

const mockNativeToken = new TestNativeCurrency(SupportedChainId.MAINNET)

describe('CurrencyAmount', () => {
  const ADDRESS_ONE = '0x0000000000000000000000000000000000000001'

  describe('constructor', () => {
    it('works', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      const amount = CurrencyAmount.fromRawAmount(token, 100)
      expect(amount.quotient).toEqual(100n)
    })
  })

  describe('#quotient', () => {
    it('returns the amount after multiplication', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      const amount = CurrencyAmount.fromRawAmount(token, 100).multiply(new Percent(15, 100))
      expect(amount.quotient).toEqual(15n)
    })
  })

  describe('#native', () => {
    it('produces native currency amount', () => {
      const amount = CurrencyAmount.fromRawAmount(mockNativeToken, 100)
      expect(amount.quotient).toEqual(100n)
      expect(amount.currency).toEqual(mockNativeToken)
    })
  })

  it('token amount can be max uint256', () => {
    // accepts JSBI input (backward compat) and native bigint
    const amountFromJsbi = CurrencyAmount.fromRawAmount(new Token(1, ADDRESS_ONE, 18), MaxUint256Jsbi)
    expect(amountFromJsbi.quotient).toEqual(MAX_UINT256)
    const amountFromBigint = CurrencyAmount.fromRawAmount(new Token(1, ADDRESS_ONE, 18), MAX_UINT256)
    expect(amountFromBigint.quotient).toEqual(MAX_UINT256)
  })
  it('token amount cannot exceed max uint256', () => {
    expect(() => CurrencyAmount.fromRawAmount(new Token(1, ADDRESS_ONE, 18), MAX_UINT256 + 1n)).toThrow('AMOUNT')
  })
  it('token amount quotient cannot exceed max uint256', () => {
    expect(() => CurrencyAmount.fromFractionalAmount(new Token(1, ADDRESS_ONE, 18), MAX_UINT256 * 2n + 2n, 2n)).toThrow(
      'AMOUNT',
    )
  })
  it('token amount numerator can be gt. uint256 if denominator is gt. 1', () => {
    const amount = CurrencyAmount.fromFractionalAmount(new Token(1, ADDRESS_ONE, 18), MAX_UINT256 + 2n, 2)
    expect(amount.numerator).toEqual(MAX_UINT256 + 2n)
  })

  describe('#toFixed', () => {
    it('throws for decimals > currency.decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 0)
      const amount = CurrencyAmount.fromRawAmount(token, 1000)
      expect(() => amount.toFixed(3)).toThrow('DECIMALS')
    })
    it('is correct for 0 decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 0)
      const amount = CurrencyAmount.fromRawAmount(token, 123456)
      expect(amount.toFixed(0)).toEqual('123456')
    })
    it('is correct for 18 decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      const amount = CurrencyAmount.fromRawAmount(token, 1e15)
      expect(amount.toFixed(9)).toEqual('0.001000000')
    })
  })

  describe('#toSignificant', () => {
    it('does not throw for sig figs > currency.decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 0)
      const amount = CurrencyAmount.fromRawAmount(token, 1000)
      expect(amount.toSignificant(3)).toEqual('1000')
    })
    it('is correct for 0 decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 0)
      const amount = CurrencyAmount.fromRawAmount(token, 123456)
      expect(amount.toSignificant(4)).toEqual('123400')
    })
    it('is correct for 18 decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      const amount = CurrencyAmount.fromRawAmount(token, 1e15)
      expect(amount.toSignificant(9)).toEqual('0.001')
    })
  })

  describe('input type compatibility', () => {
    it('accepts native bigint input', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      expect(CurrencyAmount.fromRawAmount(token, 100n).quotient.toString()).toBe('100')
    })
    it('accepts JSBI input', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      expect(CurrencyAmount.fromRawAmount(token, JSBI.BigInt(100)).quotient.toString()).toBe('100')
    })
    it('accepts string input', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      expect(CurrencyAmount.fromRawAmount(token, '100').quotient.toString()).toBe('100')
    })
    it('accepts number input', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      expect(CurrencyAmount.fromRawAmount(token, 100).quotient.toString()).toBe('100')
    })
    it('all input types produce the same quotient', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      const fromBigint = CurrencyAmount.fromRawAmount(token, 100n)
      const fromJsbi = CurrencyAmount.fromRawAmount(token, JSBI.BigInt(100))
      const fromString = CurrencyAmount.fromRawAmount(token, '100')
      const fromNumber = CurrencyAmount.fromRawAmount(token, 100)
      expect(fromBigint.quotient.toString()).toBe(fromJsbi.quotient.toString())
      expect(fromBigint.quotient.toString()).toBe(fromString.quotient.toString())
      expect(fromBigint.quotient.toString()).toBe(fromNumber.quotient.toString())
    })
  })

  describe('#add', () => {
    it('adds two currency amounts', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      const a = CurrencyAmount.fromRawAmount(token, 100)
      const b = CurrencyAmount.fromRawAmount(token, 200)
      expect(a.add(b).quotient.toString()).toBe('300')
    })
    it('preserves currency', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      const a = CurrencyAmount.fromRawAmount(token, 100)
      const b = CurrencyAmount.fromRawAmount(token, 200)
      expect(a.add(b).currency.equals(token)).toBe(true)
    })
    it('throws for different currencies', () => {
      const t1 = new Token(1, ADDRESS_ONE, 18)
      const t2 = new Token(1, '0x0000000000000000000000000000000000000002', 18)
      expect(() => CurrencyAmount.fromRawAmount(t1, 100).add(CurrencyAmount.fromRawAmount(t2, 100))).toThrow('CURRENCY')
    })
  })

  describe('#subtract', () => {
    it('subtracts two currency amounts', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      const a = CurrencyAmount.fromRawAmount(token, 200)
      const b = CurrencyAmount.fromRawAmount(token, 100)
      expect(a.subtract(b).quotient.toString()).toBe('100')
    })
    it('throws for different currencies', () => {
      const t1 = new Token(1, ADDRESS_ONE, 18)
      const t2 = new Token(1, '0x0000000000000000000000000000000000000002', 18)
      expect(() => CurrencyAmount.fromRawAmount(t1, 200).subtract(CurrencyAmount.fromRawAmount(t2, 100))).toThrow(
        'CURRENCY',
      )
    })
  })

  describe('#multiply', () => {
    it('multiplies by a Percent', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      expect(CurrencyAmount.fromRawAmount(token, 100).multiply(new Percent(15, 100)).quotient.toString()).toBe('15')
    })
    it('multiplies by a Fraction', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      expect(CurrencyAmount.fromRawAmount(token, 100).multiply(new Fraction(1, 4)).quotient.toString()).toBe('25')
    })
    it('multiplies by a scalar', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      expect(CurrencyAmount.fromRawAmount(token, 50).multiply(3).quotient.toString()).toBe('150')
    })
    it('preserves currency', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      expect(CurrencyAmount.fromRawAmount(token, 100).multiply(new Percent(50, 100)).currency.equals(token)).toBe(true)
    })
  })

  describe('#divide', () => {
    it('divides by a Fraction', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      expect(CurrencyAmount.fromRawAmount(token, 100).divide(new Fraction(1, 2)).quotient.toString()).toBe('200')
    })
    it('divides by a scalar', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      expect(CurrencyAmount.fromRawAmount(token, 100).divide(4).quotient.toString()).toBe('25')
    })
  })

  describe('#toExact', () => {
    it('does not throw for sig figs > currency.decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 0)
      const amount = CurrencyAmount.fromRawAmount(token, 1000)
      expect(amount.toExact()).toEqual('1000')
    })
    it('is correct for 0 decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 0)
      const amount = CurrencyAmount.fromRawAmount(token, 123456)
      expect(amount.toExact()).toEqual('123456')
    })
    it('is correct for 18 decimals', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      const amount = CurrencyAmount.fromRawAmount(token, 123e13)
      expect(amount.toExact()).toEqual('0.00123')
    })
    it('does not use scientific notation for very small amounts', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      // 25000 / 10^18 = 2.5e-14 — must be full decimal, not scientific notation
      const amount = CurrencyAmount.fromRawAmount(token, 25000)
      expect(amount.toExact()).toEqual('0.000000000000025')
    })
  })

  describe('#toJSON', () => {
    it('includes numerator, denominator, and currency', () => {
      const token = new Token(1, ADDRESS_ONE, 18, 'TEST', 'Test Token')
      const amount = CurrencyAmount.fromRawAmount(token, 100)
      const json = amount.toJSON()
      expect(json.numerator).toBe('100')
      expect(json.denominator).toBe('1')
      expect(json.currency).toBe(token)
    })

    it('JSON.stringify produces a plain object that survives JSON.parse (no bigint throw)', () => {
      const token = new Token(1, ADDRESS_ONE, 18, 'TEST', 'Test Token')
      const amount = CurrencyAmount.fromRawAmount(token, 100)
      const parsed = JSON.parse(JSON.stringify(amount))
      expect(parsed.numerator).toBe('100')
      expect(parsed.denominator).toBe('1')
      expect(parsed.currency.chainId).toBe(1)
      expect(parsed.currency.address).toBe(ADDRESS_ONE)
      expect(parsed.currency.decimals).toBe(18)
      expect(parsed.currency.symbol).toBe('TEST')
      expect(parsed.currency.name).toBe('Test Token')
    })

    it('round-trips via fromFractionalAmount preserving quotient', () => {
      const token = new Token(1, ADDRESS_ONE, 18)
      const original = CurrencyAmount.fromRawAmount(token, MAX_UINT256)
      const parsed = JSON.parse(JSON.stringify(original)) as { numerator: string; denominator: string }
      const restored = CurrencyAmount.fromFractionalAmount(token, parsed.numerator, parsed.denominator)
      expect(restored.quotient).toEqual(MAX_UINT256)
    })

    it('preserves native currency identity on round-trip', () => {
      const amount = CurrencyAmount.fromRawAmount(mockNativeToken, 100)
      const parsed = JSON.parse(JSON.stringify(amount))
      expect(parsed.currency.chainId).toBe(mockNativeToken.chainId)
      expect(parsed.currency.decimals).toBe(mockNativeToken.decimals)
    })
  })
})
