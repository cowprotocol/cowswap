import { formatAmountWithPrecision, formatFiatAmount, formatPercent, formatTokenAmount } from './index'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { DAI_GOERLI } from 'utils/goerli/constants'
import { USDC_GNOSIS_CHAIN } from '../../../custom/utils/gnosis_chain/constants'

describe('Amounts formatting', () => {
  const decimals = DAI_GOERLI.decimals
  const getAmount = (value: string, decimalsShift: number) =>
    CurrencyAmount.fromRawAmount(DAI_GOERLI, value + '0'.repeat(decimals + decimalsShift))

  describe('Amounts', () => {
    it('Zero amount', () => {
      const result = formatTokenAmount(getAmount('0', 0))

      expect(result).toBe('0')
    })

    it('Extra small amount', () => {
      const result = formatTokenAmount(getAmount('1', -decimals))

      expect(result).toBe('< 0.000001')
    })

    it('Small amount', () => {
      const result = formatTokenAmount(getAmount('1', -4))

      expect(result).toBe('0.0001')
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
          '999200146079960203000000000000000000'
        )
      )

      expect(result).toBe('1')
    })

    it('Precision for fiat amounts is always 2', () => {
      const result1 = formatFiatAmount(getAmount('734436023451', -5))
      const result2 = formatFiatAmount(getAmount('60001444', 3))

      expect(result1).toBe('7,344,360.23')
      expect(result2).toBe('60.00B')
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
