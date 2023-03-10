import { Currency, Percent, Price } from '@uniswap/sdk-core'
// import { DAI_GOERLI, USDC_GOERLI } from 'utils/goerli/constants'
import { buildPriceFromCurrencyAmounts } from '@cow/modules/limitOrders/utils/buildPriceFromCurrencyAmounts'
import { calculatePriceDifference, CalculatePriceDifferenceParams } from './calculatePriceDifference'
import tryParseCurrencyAmount from '../../../../custom/lib/utils/tryParseCurrencyAmount'
import { DAI_GOERLI, USDC_GOERLI } from '../../../../custom/utils/goerli/constants'

// const USDC_1000 = tryParseCurrencyAmount('1000', USDC_GOERLI)
// const DAI_999 = _daiCurrencyAmount('999')
// const DAI_1000 = _daiCurrencyAmount('1000')

/**
 * Dumb helper just to make it clearer to create DAI CurrencyAmount instances
 */
function _daiCurrencyAmount(amount: string) {
  return tryParseCurrencyAmount(amount, DAI_GOERLI)
}

function buildPrice(usdcAmount: string, daiAmount: string): Price<Currency, Currency> {
  const baseAmount = tryParseCurrencyAmount(usdcAmount, USDC_GOERLI)
  const quoteAmount = tryParseCurrencyAmount(daiAmount, DAI_GOERLI)
  return buildPriceFromCurrencyAmounts(baseAmount, quoteAmount)
}

describe('calculatePriceDifference', () => {
  it('returns `null` when any parameter is missing', () => {
    expect(
      calculatePriceDifference({
        reference: null,
        delta: null,
        isInverted: false,
      })
    ).toBe(null)
  })

  describe('regular', () => {
    const baseParams = {
      isInverted: false,
    }

    test('0 difference', () => {
      const params: CalculatePriceDifferenceParams = {
        ...baseParams,
        reference: buildPrice('1', '1'),
        delta: buildPrice('1', '1'),
      }

      const result = calculatePriceDifference(params)

      expect(result?.percentage.toFixed(2)).toBe('0.00')
      expect(result?.amount.toFixed(2)).toBe('0.00')
    })

    test('10% price diff, 0.1 amount diff', () => {
      const params: CalculatePriceDifferenceParams = {
        ...baseParams,
        reference: buildPrice('10', '11'),
        delta: buildPrice('1', '1'),
      }

      const result = calculatePriceDifference(params)

      expect(result?.percentage.toFixed(2)).toBe('10.00')
      expect(result?.amount.toFixed(10)).toBe('0.1000000000')
    })

    test('-10% price diff, -0.1111111111 amount diff', () => {
      const params: CalculatePriceDifferenceParams = {
        ...baseParams,
        reference: buildPrice('1', '1'),
        delta: buildPrice('9', '10'),
      }

      const result = calculatePriceDifference(params)

      expect(result?.percentage.toFixed(2)).toBe('-10.00')
      expect(result?.amount.toFixed(10)).toBe('-0.1111111111')
    })

    test('0.1% price diff, ?? amount diff', () => {
      const params: CalculatePriceDifferenceParams = {
        ...baseParams,
        reference: buildPrice('1000', '1001'),
        delta: buildPrice('9', '10'),
      }

      const result = calculatePriceDifference(params)

      expect(result?.percentage.toFixed(2)).toBe('-10.00')
      expect(result?.amount.toFixed(10)).toBe('-0.1111111111')
    })
  })
})

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
