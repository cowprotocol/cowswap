import { USDC_GNOSIS_CHAIN, USDC_SEPOLIA, WETH_SEPOLIA } from '@cowprotocol/common-const'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { formatAmountWithPrecision, formatFiatAmount, formatPercent, formatTokenAmount } from './index'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('Amounts formatting', () => {
  const decimals = WETH_SEPOLIA.decimals
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const getAmount = (value: string, decimalsShift: number, token = WETH_SEPOLIA) =>
    CurrencyAmount.fromRawAmount(token, value + '0'.repeat(token.decimals + decimalsShift))

  // TODO: Break down this large function into smaller functions
  // eslint-disable-next-line max-lines-per-function
  describe('Amounts', () => {
    it('Zero amount', () => {
      const result = formatTokenAmount(getAmount('0', 0)) // 0 WETH

      expect(result).toBe('0')
    })

    it('Extra small amount', () => {
      const result = formatTokenAmount(getAmount('1', -decimals)) // 1e-18 WETH

      expect(result).toBe('0.000000000000000001')
    })

    it('Small amount', () => {
      const result = formatTokenAmount(getAmount('1', -4)) // 1e-4 WETH

      expect(result).toBe('0.0001')
    })

    it('Trim one trailing zero', () => {
      const result = formatTokenAmount(getAmount('1000010', -4)) // 100.0010

      expect(result).toBe('100.001')
    })

    it('Trim two trailing zero', () => {
      const result = formatTokenAmount(getAmount('10000100', -5)) // 100.00100

      expect(result).toBe('100.001')
    })

    it('Trim all trailing zero (for exact)', () => {
      const result = formatTokenAmount(getAmount('10000000', -5)) // 100.00000

      expect(result).toBe('100')
    })

    it('Trim all trailing zero (when rounded down to zero)', () => {
      const result = formatTokenAmount(getAmount('10000001', -5)) // 100.00001

      expect(result).toBe('100')
    })

    it('Trim all trailing zero (when rounded up to zero)', () => {
      const result = formatTokenAmount(getAmount('9999999', -5)) // 99.99999

      expect(result).toBe('100')
    })

    it('Format decimals up (when rounded up to zero, 6 decimals)', () => {
      const result = formatTokenAmount(getAmount('1850999994', -6, USDC_SEPOLIA)) //1850.999994

      expect(result).toBe('1,851')
    })

    it('One amount', () => {
      const result = formatTokenAmount(getAmount('1', 0))

      expect(result).toBe('1')
    })

    it('Regular amount', () => {
      const result = formatTokenAmount(getAmount('1', 3))

      expect(result).toBe('1,000')
    })

    it('Thousands amount', () => {
      const result = formatTokenAmount(getAmount('1', 4))

      expect(result).toBe('10,000')
    })

    it('Hundreds thousands amount', () => {
      const result = formatTokenAmount(getAmount('23', 4))

      expect(result).toBe('230,000')
    })

    it('Millions amount', () => {
      const result = formatTokenAmount(getAmount('5456', 3))

      expect(result).toBe('5,456,000')
    })

    it('Billions amount', () => {
      const result = formatTokenAmount(getAmount('9307222438', 0))

      expect(result).toBe('9.307B')
    })

    it('Trillions amount', () => {
      const result = formatTokenAmount(getAmount('45676822', 9))

      expect(result).toBe('45,676.822T')
    })
  })

  describe('Precision', () => {
    it('When the amount is less than 1, then precision is 6', () => {
      const result = formatTokenAmount(getAmount('1123456', -8))

      expect(result).toBe('0.011235')
    })

    it('When the amount is less than 100_000, then precision is 4', () => {
      const result = formatTokenAmount(getAmount('7850450043', -5))

      expect(result).toBe('78,504.5004')
    })

    it('When the amount is less than 1M, then precision is 3', () => {
      const result = formatTokenAmount(getAmount('60023003367', -5))

      expect(result).toBe('600,230.034')
    })

    it('When the amount is less than 10M, then precision is 2', () => {
      const result = formatTokenAmount(getAmount('902355432336', -5))

      expect(result).toBe('9,023,554.32')
    })

    it('When the amount is greater than 10M, then precision is 3', () => {
      const result1 = formatTokenAmount(getAmount('1093393493', 1))
      const result2 = formatTokenAmount(getAmount('34392220011', 1))
      const result3 = formatTokenAmount(getAmount('3244302333422', 1))

      expect(result1).toBe('10.934B')
      expect(result2).toBe('343.922B')
      expect(result3).toBe('32.443T')
    })
  })

  describe('Fiat amounts', () => {
    it('When the amount is almost 1, it must be rounded up to 1', () => {
      const result = formatFiatAmount(
        // ~0.995
        CurrencyAmount.fromFractionalAmount(
          USDC_GNOSIS_CHAIN,
          '994582567877074269904770000000000000000000',
          '999200146079960203000000000000000000',
        ),
      )

      expect(result).toBe('1')
    })

    it('Precision for fiat amounts is always 2', () => {
      const result1 = formatFiatAmount(getAmount('734436023451', -5))
      const result2 = formatFiatAmount(getAmount('60001444', 3))

      expect(result1).toBe('7,344,360.23')
      expect(result2).toBe('60B')
    })
  })

  describe('Percent', () => {
    it('Regular percent', () => {
      const result = formatPercent(new Percent(100, 2000))

      expect(result).toBe('5')
    })

    it('Negative percent', () => {
      const result = formatPercent(new Percent(2, 1).multiply(-1))

      expect(result).toBe('-200')
    })

    it('With decimals', () => {
      const result = formatPercent(new Percent(31500, 25634562))

      expect(result).toBe('0.12')
    })
  })

  describe('Internationalization', () => {
    it('ES', () => {
      const numberFormat = new Intl.NumberFormat('es')
      const result = formatAmountWithPrecision(getAmount('7850450043', -5), 2, numberFormat)

      expect(result).toBe('78.504,5')
    })

    it('EN', () => {
      const numberFormat = new Intl.NumberFormat('en')
      const result = formatAmountWithPrecision(getAmount('7850450043', -5), 2, numberFormat)

      expect(result).toBe('78,504.5')
    })

    it('RU', () => {
      const numberFormat = new Intl.NumberFormat('ru')
      const result = formatAmountWithPrecision(getAmount('7850450043', -5), 2, numberFormat)

      expect(result).toBe('78 504,5')
    })
  })
})
