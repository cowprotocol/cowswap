import { GNO, USDC_SEPOLIA, ZERO_FRACTION } from '@cowprotocol/common-const'
import { buildPriceFromCurrencyAmounts, FractionUtils, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, Price } from '@uniswap/sdk-core'

import { calculatePriceDifference, CalculatePriceDifferenceParams } from './calculatePriceDifference'

const GNO_SEPOLIA = GNO[SupportedChainId.SEPOLIA]

function buildPrice(daiAmount: string, usdcAmount: string): Price<Currency, Currency> {
  const quoteAmount = tryParseCurrencyAmount(daiAmount, GNO_SEPOLIA)
  const baseAmount = tryParseCurrencyAmount(usdcAmount, USDC_SEPOLIA)

  return buildPriceFromCurrencyAmounts(baseAmount, quoteAmount)
}

describe('Not enough parameters (returns null)', () => {
  it('returns `null` when referencePrice is missing', () => {
    expect(
      calculatePriceDifference({
        referencePrice: undefined,
        targetPrice: buildPrice('1', '1'),
        isInverted: false,
      })
    ).toBe(null)
  })
  it('returns `null` when referencePrice is null', () => {
    expect(
      calculatePriceDifference({
        referencePrice: null,
        targetPrice: buildPrice('1', '1'),
        isInverted: false,
      })
    ).toBe(null)
  })

  it('returns `null` when targetPrice is null', () => {
    expect(
      calculatePriceDifference({
        referencePrice: buildPrice('1', '1'),
        targetPrice: null,
        isInverted: false,
      })
    ).toBe(null)
  })
})

describe('Prices are Negative or Zero', () => {
  test('Both prices are Zero, return null', () => {
    const params: CalculatePriceDifferenceParams = {
      referencePrice: buildPrice('0', '1'),
      targetPrice: buildPrice('0', '1'),
      isInverted: false,
    }

    expect(calculatePriceDifference(params)).toBe(null)
  })

  test('ReferencePrice is Zero, return null', () => {
    const params: CalculatePriceDifferenceParams = {
      referencePrice: buildPrice('0', '1'),
      targetPrice: buildPrice('1', '1'),
      isInverted: false,
    }

    expect(calculatePriceDifference(params)).toBe(null)
  })
})

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('Not Inverted Price', () => {
  const baseParams = {
    isInverted: false,
  }

  describe('Prices are equal', () => {
    test('0% price difference, when both prices are equal', () => {
      const params: CalculatePriceDifferenceParams = {
        ...baseParams,
        referencePrice: buildPrice('1', '1'),
        targetPrice: buildPrice('1', '1'),
      }

      const result = calculatePriceDifference(params)

      expect(result?.percentage.toFixed(2)).toBe('0.00')
      expect(result?.amount.toFixed(2)).toBe('0.00')
    })
  })

  describe('Target Price is ABOVE Reference Prices', () => {
    test('10% price difference', () => {
      const params: CalculatePriceDifferenceParams = {
        ...baseParams,
        targetPrice: buildPrice('11', '10'), // 1.1
        referencePrice: buildPrice('1', '1'), // 1
      }

      const result = calculatePriceDifference(params)

      expect(result?.amount.toFixed(10)).toBe('0.1000000000') // 1.1 - 1 = 0.1
      expect(result?.percentage.toFixed(2)).toBe('10.00') //  0.1 / 1 * 100 = 10
    })

    test('0.1% price difference', () => {
      const params: CalculatePriceDifferenceParams = {
        ...baseParams,
        targetPrice: buildPrice('1001', '1000'), // 1001/1000 = 1.001
        referencePrice: buildPrice('1', '1'), // 1
      }

      const result = calculatePriceDifference(params)

      expect(result?.amount.toFixed(10)).toBe('0.0010000000') // 1.001 - 1
      expect(result?.percentage.toFixed(2)).toBe('0.10') // (1.001 - 1) / 1 * 100 = 0.1
    })
  })

  describe('Target Price is BELOW Reference Prices', () => {
    test('-10% price difference', () => {
      const params: CalculatePriceDifferenceParams = {
        ...baseParams,
        targetPrice: buildPrice('1', '1'), // 1
        referencePrice: buildPrice('10', '9'), // 10/9
      }

      const result = calculatePriceDifference(params)

      expect(result?.amount.toFixed(10)).toBe('-0.1111111111') // 1 - 10/9 = -0.1111111111
      expect(result?.percentage.toFixed(2)).toBe('-10.00') // (1 - 10/9) / (10/9) * 100 = -10
    })

    test('-100% price difference (target price is Zero)', () => {
      const params: CalculatePriceDifferenceParams = {
        referencePrice: buildPrice('1', '1'),
        targetPrice: FractionUtils.toPrice(ZERO_FRACTION, USDC_SEPOLIA, GNO_SEPOLIA), // zero
        isInverted: false,
      }

      const result = calculatePriceDifference(params)

      expect(result).toBe(null)
    })
  })
})

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
describe('Inverted Price', () => {
  const baseParams = {
    isInverted: true,
  }

  describe('Prices are equal', () => {
    test('0% price difference, when both prices are equal', () => {
      const params: CalculatePriceDifferenceParams = {
        ...baseParams,
        referencePrice: buildPrice('1', '1'),
        targetPrice: buildPrice('1', '1'),
      }

      const result = calculatePriceDifference(params)

      expect(result?.percentage.toFixed(2)).toBe('0.00')
      expect(result?.amount.toFixed(2)).toBe('0.00')
    })
  })

  describe('Target Price is ABOVE Reference Prices (therefore is below)', () => {
    test('10% price difference', () => {
      const params: CalculatePriceDifferenceParams = {
        ...baseParams,
        targetPrice: buildPrice('10', '11'), // 10/11 ---> 10/11 = 1.1
        referencePrice: buildPrice('1', '1'), // 1
      }

      const result = calculatePriceDifference(params)

      expect(result?.amount.toFixed(6)).toBe('0.100000') // 1.1 - 1 = 0.1
      expect(result?.percentage.toFixed(2)).toBe('10.00') //  0.1 / 1 * 100 = 10
    })

    test('0.1% price difference', () => {
      const params: CalculatePriceDifferenceParams = {
        ...baseParams,
        targetPrice: buildPrice('1000', '1001'), // 1000/1001  ---> 1001/1000  = 1.001
        referencePrice: buildPrice('1', '1'), // 1
      }

      const result = calculatePriceDifference(params)

      expect(result?.amount.toFixed(6)).toBe('0.001000') // 1.001 - 1
      expect(result?.percentage.toFixed(2)).toBe('0.10') // (1.001 - 1) / 1 * 100 = 0.1
    })
  })

  describe('Target Price is BELOW Reference Prices', () => {
    test('-10% price difference', () => {
      const params: CalculatePriceDifferenceParams = {
        ...baseParams,
        targetPrice: buildPrice('1', '1'), // 1
        referencePrice: buildPrice('9', '10'), // 9/10 ---> 10/9
      }

      const result = calculatePriceDifference(params)

      expect(result?.amount.toFixed(6)).toBe('-0.111111') // 1 - 10/9 = -0.111111
      expect(result?.percentage.toFixed(2)).toBe('-10.00') // (1 - 10/9) / (10/9) * 100 = -10
    })
  })
})
