import { CurrencyAmount } from '@uniswap/sdk-core'
import { DAI_GOERLI, USDC_GOERLI } from 'utils/goerli/constants'
import { rawToTokenAmount } from '@cow/utils/rawToTokenAmount'
import { buildPriceFromCurrencyAmounts } from '@cow/modules/limitOrders/utils/buildPriceFromCurrencyAmounts'
import { calculateOrderExecutionStatus, CalculateOrderExecutionStatusParams } from './calculateOrderExecutionStatus'

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
        marketPrice: null,
        executionPrice: null,
      })
    ).toBe(undefined)
  })

  describe('limit price below market price', () => {
    const baseParams = {
      limitPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_999),
    }

    test('market price <0.5% from execution price', () => {
      const params: CalculateOrderExecutionStatusParams = {
        ...baseParams,
        marketPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
        executionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1001)),
      }

      expect(calculateOrderExecutionStatus(params)).toBe('veryClose')
    })
    test('market price 0.5-5% from execution price', () => {
      const lowerBound: CalculateOrderExecutionStatusParams = {
        ...baseParams,
        marketPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
        executionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1005)),
      }

      expect(calculateOrderExecutionStatus(lowerBound)).toBe('close')

      const middleRange: CalculateOrderExecutionStatusParams = {
        ...baseParams,
        marketPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
        executionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1025)),
      }

      expect(calculateOrderExecutionStatus(middleRange)).toBe('close')

      const upperBound: CalculateOrderExecutionStatusParams = {
        ...baseParams,
        marketPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
        executionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1050)),
      }

      expect(calculateOrderExecutionStatus(upperBound)).toBe('close')
    })
    test('market price >5% from execution price', () => {
      const params: CalculateOrderExecutionStatusParams = {
        ...baseParams,
        marketPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
        executionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(1051)),
      }

      expect(calculateOrderExecutionStatus(params)).toBe('notClose')
    })
  })
  describe('limit price above market price', () => {
    const baseParams = {
      limitPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_1000),
      marketPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(900)),
    }

    test('market price <0.5% from execution price', () => {
      const params: CalculateOrderExecutionStatusParams = {
        ...baseParams,
        executionPrice: buildPriceFromCurrencyAmounts(USDC_1000, DAI_999),
      }

      expect(calculateOrderExecutionStatus(params)).toBe('veryClose')
    })
    test('market price 0.5-5% from execution price', () => {
      const lowerBound: CalculateOrderExecutionStatusParams = {
        ...baseParams,
        executionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(995)),
      }

      expect(calculateOrderExecutionStatus(lowerBound)).toBe('close')

      const middleRange: CalculateOrderExecutionStatusParams = {
        ...baseParams,
        executionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(990)),
      }

      expect(calculateOrderExecutionStatus(middleRange)).toBe('close')

      const upperBound: CalculateOrderExecutionStatusParams = {
        ...baseParams,
        executionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(950)),
      }

      expect(calculateOrderExecutionStatus(upperBound)).toBe('close')
    })
    test('market price >5% from execution price', () => {
      const params: CalculateOrderExecutionStatusParams = {
        ...baseParams,
        executionPrice: buildPriceFromCurrencyAmounts(USDC_1000, _daiCurrencyAmount(949)),
      }

      expect(calculateOrderExecutionStatus(params)).toBe('notClose')
    })
  })
})
