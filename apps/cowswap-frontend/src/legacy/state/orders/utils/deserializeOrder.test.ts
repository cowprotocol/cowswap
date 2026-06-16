import { TokenWithLogo } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@cowprotocol/currency'

import { deserializeBridgeOutputAmount } from './deserializeOrder'

const USDC_PLAIN = {
  chainId: 1,
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  decimals: 6,
  symbol: 'USDC',
  name: 'USD Coin',
  logoURI: 'https://example.com/usdc.png',
}

const usdcToken = TokenWithLogo.fromToken(
  {
    chainId: USDC_PLAIN.chainId,
    address: USDC_PLAIN.address,
    decimals: USDC_PLAIN.decimals,
    symbol: USDC_PLAIN.symbol,
    name: USDC_PLAIN.name,
  },
  USDC_PLAIN.logoURI,
)

describe('deserializeBridgeOutputAmount', () => {
  describe('happy paths — recovers a CurrencyAmount from each known shape', () => {
    it('returns the input as-is when it is already a CurrencyAmount instance', () => {
      const original = CurrencyAmount.fromRawAmount(usdcToken, 100)
      expect(deserializeBridgeOutputAmount(original)).toBe(original)
    })

    it('decodes post-toJSON-fix shape (numerator/denominator as decimal strings)', () => {
      const result = deserializeBridgeOutputAmount({
        numerator: '100000000',
        denominator: '1',
        currency: USDC_PLAIN,
      })
      expect(result).toBeInstanceOf(CurrencyAmount)
      expect(result?.quotient).toBe(100000000n)
      expect(result?.currency.equals(usdcToken)).toBe(true)
    })

    it('decodes in-memory shape (native bigint numerator/denominator, no JSON round-trip)', () => {
      const result = deserializeBridgeOutputAmount({
        numerator: 100n,
        denominator: 1n,
        currency: USDC_PLAIN,
      })
      expect(result?.quotient).toBe(100n)
    })

    it('decodes legacy JSBI shape — numerator/denominator as plain arrays of 30-bit limbs', () => {
      // JSBI.BigInt(100) is internally stored as Array<number> with one limb [100].
      // After JSON.stringify/parse the Array survives and the methods are lost.
      const result = deserializeBridgeOutputAmount({
        numerator: [100],
        denominator: [1],
        currency: USDC_PLAIN,
      })
      expect(result?.quotient).toBe(100n)
    })

    it('decodes legacy JSBI shape — numerator/denominator as objects keyed by numeric strings', () => {
      const result = deserializeBridgeOutputAmount({
        numerator: { '0': 100 },
        denominator: { '0': 1 },
        currency: USDC_PLAIN,
      })
      expect(result?.quotient).toBe(100n)
    })

    it('decodes multi-limb JSBI values (low limb at index 0, little-endian)', () => {
      // 2^40 in JSBI's 30-bit-per-limb layout: low=0, high=2^10=1024
      // (because 2^40 = 2^30 * 2^10). Verified against JSBI@3.2.5.
      const result = deserializeBridgeOutputAmount({
        numerator: [0, 1024],
        denominator: [1],
        currency: USDC_PLAIN,
      })
      expect(result?.quotient).toBe(2n ** 40n)
    })

    it('decodes a real JSBI snapshot of 1 ETH in wei (1e18)', () => {
      // Captured from JSBI.BigInt('1000000000000000000') at runtime:
      //   limbs = [660865024, 931322574]
      // The whole point of this PR — bridge orders persisted with the old JSBI
      // representation must round-trip back to the correct on-chain amount.
      const result = deserializeBridgeOutputAmount({
        numerator: [660865024, 931322574],
        denominator: [1],
        currency: USDC_PLAIN,
      })
      expect(result?.quotient).toBe(10n ** 18n)
    })

    it('accepts numeric (not just string) numerator/denominator', () => {
      const result = deserializeBridgeOutputAmount({
        numerator: 100,
        denominator: 1,
        currency: USDC_PLAIN,
      })
      expect(result?.quotient).toBe(100n)
    })
  })

  describe('returns undefined on unrecoverable input', () => {
    it.each([
      ['null', null],
      ['undefined', undefined],
      ['empty string', ''],
      ['number primitive', 42],
      ['string primitive', 'not-a-currency-amount'],
    ])('returns undefined for %s', (_, input) => {
      expect(deserializeBridgeOutputAmount(input)).toBeUndefined()
    })

    it('returns undefined when numerator is missing', () => {
      expect(
        deserializeBridgeOutputAmount({
          denominator: '1',
          currency: USDC_PLAIN,
        }),
      ).toBeUndefined()
    })

    it('returns undefined when currency is missing', () => {
      expect(
        deserializeBridgeOutputAmount({
          numerator: '100',
          denominator: '1',
        }),
      ).toBeUndefined()
    })

    it('returns undefined when currency has no chainId', () => {
      expect(
        deserializeBridgeOutputAmount({
          numerator: '100',
          denominator: '1',
          currency: { address: USDC_PLAIN.address, decimals: 6 },
        }),
      ).toBeUndefined()
    })

    it('returns undefined when currency has no address', () => {
      expect(
        deserializeBridgeOutputAmount({
          numerator: '100',
          denominator: '1',
          currency: { chainId: 1, decimals: 6 },
        }),
      ).toBeUndefined()
    })

    it('returns undefined for zero denominator (division-by-zero guard)', () => {
      expect(
        deserializeBridgeOutputAmount({
          numerator: '1',
          denominator: '0',
          currency: USDC_PLAIN,
        }),
      ).toBeUndefined()
    })

    it('returns undefined for unparseable numerator string', () => {
      expect(
        deserializeBridgeOutputAmount({
          numerator: 'not-a-number',
          denominator: '1',
          currency: USDC_PLAIN,
        }),
      ).toBeUndefined()
    })

    it('returns undefined for JSBI-like object with non-numeric limbs', () => {
      expect(
        deserializeBridgeOutputAmount({
          numerator: { '0': 'garbage' },
          denominator: '1',
          currency: USDC_PLAIN,
        }),
      ).toBeUndefined()
    })

    it('returns undefined for non-finite number numerator', () => {
      expect(
        deserializeBridgeOutputAmount({
          numerator: Infinity,
          denominator: '1',
          currency: USDC_PLAIN,
        }),
      ).toBeUndefined()
    })

    it('returns undefined for number numerator above MAX_SAFE_INTEGER (would lose precision)', () => {
      expect(
        deserializeBridgeOutputAmount({
          numerator: Number.MAX_SAFE_INTEGER + 1,
          denominator: '1',
          currency: USDC_PLAIN,
        }),
      ).toBeUndefined()
    })

    it('returns undefined for non-integer number numerator', () => {
      expect(
        deserializeBridgeOutputAmount({
          numerator: 1.5,
          denominator: '1',
          currency: USDC_PLAIN,
        }),
      ).toBeUndefined()
    })
  })

  describe('currency rehydration', () => {
    it('reconstructs currency as a TokenWithLogo instance with prototype methods', () => {
      const result = deserializeBridgeOutputAmount({
        numerator: '100',
        denominator: '1',
        currency: USDC_PLAIN,
      })
      // The whole point of the helper: callers expect a real CurrencyAmount with real methods.
      // Without rehydration `.equalTo` would be undefined and rendering would crash.
      expect(result?.equalTo(0)).toBe(false)
      expect(result?.currency).toBeInstanceOf(TokenWithLogo)
    })

    it('preserves logoURI when present', () => {
      const result = deserializeBridgeOutputAmount({
        numerator: '100',
        denominator: '1',
        currency: USDC_PLAIN,
      })
      expect((result?.currency as TokenWithLogo).logoURI).toBe(USDC_PLAIN.logoURI)
    })

    it('falls back to empty symbol/name when missing', () => {
      const result = deserializeBridgeOutputAmount({
        numerator: '100',
        denominator: '1',
        currency: { chainId: 1, address: USDC_PLAIN.address, decimals: 6 },
      })
      expect(result?.currency.symbol).toBe('')
      expect(result?.currency.name).toBe('')
    })
  })
})
