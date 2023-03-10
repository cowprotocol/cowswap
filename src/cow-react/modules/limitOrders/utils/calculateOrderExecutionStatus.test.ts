import { CurrencyAmount } from '@uniswap/sdk-core'
import { DAI_GOERLI, USDC_GOERLI } from 'utils/goerli/constants'
import { rawToTokenAmount } from '@cow/utils/rawToTokenAmount'
import { buildPriceFromCurrencyAmounts } from '@cow/modules/limitOrders/utils/buildPriceFromCurrencyAmounts'
import { calculateOrderExecutionStatus, CalculatePriceDifferenceParams } from './calculateOrderExecutionStatus'

const USDC_1000 = CurrencyAmount.fromRawAmount(USDC_GOERLI, rawToTokenAmount(1000, USDC_GOERLI.decimals))
const DAI_999 = _daiCurrencyAmount(999)
const DAI_1000 = _daiCurrencyAmount(1000)

/**
 * Dumb helper just to make it clearer to create DAI CurrencyAmount instances
 */
function _daiCurrencyAmount(amount: number) {
  return CurrencyAmount.fromRawAmount(DAI_GOERLI, rawToTokenAmount(amount, DAI_GOERLI.decimals))
}

describe('calculateOrderExecutionStatus', () => {
  it('returns `undefined` when any parameter is missing', () => {
    expect(
      calculateOrderExecutionStatus({
        limitPrice: null,
        spotPrice: null,
        estimatedExecutionPrice: null,
      })
    ).toBe(undefined)
  })

  describe('limit price below market price', () => {
    // Limit price will never be above estimated execution price
    const baseParams = {
      limitPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_999),
    }

    describe('market price <0.5% from execution price', () => {
      test('positive difference', () => {
        const params: CalculatePriceDifferenceParams = {
          ...baseParams,
          spotPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
          estimatedExecutionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1001)),
        }

        expect(calculateOrderExecutionStatus(params)).toBe('veryClose')
      })

      test('negative difference', () => {
        const params: CalculatePriceDifferenceParams = {
          ...baseParams,
          limitPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(990)),
          spotPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
          estimatedExecutionPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_999),
        }

        expect(calculateOrderExecutionStatus(params)).toBe('veryClose')
      })
    })
    describe('market price 0.5-5% from execution price', () => {
      test('0.5% - lower bond', () => {
        const params: CalculatePriceDifferenceParams = {
          ...baseParams,
          spotPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
          estimatedExecutionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1005)),
        }

        expect(calculateOrderExecutionStatus(params)).toBe('close')
      })

      test('2.5% - middle range', () => {
        const params: CalculatePriceDifferenceParams = {
          ...baseParams,
          spotPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
          estimatedExecutionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1025)),
        }

        expect(calculateOrderExecutionStatus(params)).toBe('close')
      })

      test('5% - upper bond', () => {
        const params: CalculatePriceDifferenceParams = {
          ...baseParams,
          spotPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
          estimatedExecutionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1050)),
        }

        expect(calculateOrderExecutionStatus(params)).toBe('close')
      })
    })
    test('market price >5% from execution price', () => {
      const params: CalculatePriceDifferenceParams = {
        ...baseParams,
        spotPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
        estimatedExecutionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1051)),
      }

      expect(calculateOrderExecutionStatus(params)).toBe('notClose')
    })
  })
})
