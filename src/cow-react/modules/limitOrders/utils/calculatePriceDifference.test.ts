import { Currency, Price } from '@uniswap/sdk-core'
// import { DAI_GOERLI, USDC_GOERLI } from 'utils/goerli/constants'
import { calculatePriceDifference, CalculatePriceDifferenceParams } from './calculatePriceDifference'
import tryParseCurrencyAmount from '../../../../custom/lib/utils/tryParseCurrencyAmount'
import { DAI_GOERLI, USDC_GOERLI } from '../../../../custom/utils/goerli/constants'
import { buildPriceFromCurrencyAmounts } from './buildPriceFromCurrencyAmounts'
import { FractionUtils } from '../../../utils/fractionUtils'
import { ZERO_FRACTION } from '../../../../custom/constants'

// const USDC_1000 = tryParseCurrencyAmount('1000', USDC_GOERLI)
// const DAI_999 = _daiCurrencyAmount('999')
// const DAI_1000 = _daiCurrencyAmount('1000')

// /**
//  * Dumb helper just to make it clearer to create DAI CurrencyAmount instances
//  */
// function _daiCurrencyAmount(amount: string) {
//   return tryParseCurrencyAmount(amount, DAI_GOERLI)
// }

function buildPrice(daiAmount: string, usdcAmount: string): Price<Currency, Currency> {
  const quoteAmount = tryParseCurrencyAmount(daiAmount, DAI_GOERLI)
  const baseAmount = tryParseCurrencyAmount(usdcAmount, USDC_GOERLI)

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

  describe('Target Price is BELLOW Reference Prices', () => {
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
        targetPrice: FractionUtils.toPrice(ZERO_FRACTION, USDC_GOERLI, DAI_GOERLI), // zero
        isInverted: false,
      }

      const result = calculatePriceDifference(params)
      console.log('result', result)

      expect(result?.amount.toFixed(2)).toBe('-1.00')
      expect(result?.percentage.toFixed(2)).toBe('-100.00')
    })
  })
})

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

  describe('Target Price is BELLOW Reference Prices', () => {
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

    test('-100% price difference (target price is Zero)', () => {
      const params: CalculatePriceDifferenceParams = {
        referencePrice: buildPrice('1', '1'),
        targetPrice: FractionUtils.toPrice(ZERO_FRACTION, USDC_GOERLI, DAI_GOERLI), // zero
        isInverted: false,
      }

      const result = calculatePriceDifference(params)
      console.log('result', result)

      expect(result?.amount.toFixed(2)).toBe('-1.00')
      expect(result?.percentage.toFixed(2)).toBe('-100.00')
    })
  })
})

// TODO: @alfetopito, I don't delete these, but we would need to move these to a new test file for "calculateOrderExecutionStatus"
// describe('calculateOrderExecutionStatus', () => {
//   it("returns 'veryClose' when negative")
//
//   describe('limit price below market price', () => {
//     // Limit price will never be above estimated execution price
//     const baseParams = {
//       limitPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_999),
//     }
//
//     describe('market price <0.5% from execution price', () => {
//       test('positive difference', () => {
//         const params: CalculatePriceDifferenceParams = {
//           ...baseParams,
//           spotPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
//           estimatedExecutionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1001)),
//         }
//
//         expect(calculateOrderExecutionStatus(params)).toBe('veryClose')
//       })
//
//       test('negative difference', () => {
//         const params: CalculatePriceDifferenceParams = {
//           ...baseParams,
//           limitPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(990)),
//           spotPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
//           estimatedExecutionPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_999),
//         }
//
//         expect(calculateOrderExecutionStatus(params)).toBe('veryClose')
//       })
//     })
//     describe('market price 0.5-5% from execution price', () => {
//       test('0.5% - lower bond', () => {
//         const params: CalculatePriceDifferenceParams = {
//           ...baseParams,
//           spotPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
//           estimatedExecutionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1005)),
//         }
//
//         expect(calculateOrderExecutionStatus(params)).toBe('close')
//       })
//
//       test('2.5% - middle range', () => {
//         const params: CalculatePriceDifferenceParams = {
//           ...baseParams,
//           spotPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
//           estimatedExecutionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1025)),
//         }
//
//         expect(calculateOrderExecutionStatus(params)).toBe('close')
//       })
//
//       test('5% - upper bond', () => {
//         const params: CalculatePriceDifferenceParams = {
//           ...baseParams,
//           spotPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
//           estimatedExecutionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1050)),
//         }
//
//         expect(calculateOrderExecutionStatus(params)).toBe('close')
//       })
//     })
//     test('market price >5% from execution price', () => {
//       const params: CalculatePriceDifferenceParams = {
//         ...baseParams,
//         spotPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
//         estimatedExecutionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1051)),
//       }
//
//       expect(calculateOrderExecutionStatus(params)).toBe('notClose')
//     })
//   })
// })
