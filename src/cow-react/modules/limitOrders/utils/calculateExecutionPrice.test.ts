import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import { USDC_GOERLI, WETH_GOERLI } from 'utils/goerli/constants'
import { rawToTokenAmount } from '../../../utils/rawToTokenAmount'
import { calculateExecutionPrice, convertAmountToCurrency } from './calculateExecutionPrice'
import { OrderKind } from '@cowprotocol/contracts'

describe('calculateExecutionPrice', () => {
  describe('When market price is less than execution price', () => {
    const marketPrice = new Fraction(0, 1) // 0

    it('When fee is zero then the result must be just output / input', () => {
      const amount = calculateExecutionPrice({
        inputCurrencyAmount: CurrencyAmount.fromRawAmount(USDC_GOERLI, rawToTokenAmount(6000, USDC_GOERLI.decimals)),
        outputCurrencyAmount: CurrencyAmount.fromRawAmount(WETH_GOERLI, rawToTokenAmount(3, WETH_GOERLI.decimals)),
        feeAmount: CurrencyAmount.fromRawAmount(USDC_GOERLI, rawToTokenAmount(0, USDC_GOERLI.decimals)),
        marketRate: marketPrice,
        orderKind: OrderKind.SELL,
      })

      // 3 / 6000 = 0.0005
      expect(amount?.toSignificant(10)).toBe('0.0005')
    })

    it('The fee must be subtracted from the execution price', () => {
      const amount = calculateExecutionPrice({
        inputCurrencyAmount: CurrencyAmount.fromRawAmount(USDC_GOERLI, rawToTokenAmount(6000, USDC_GOERLI.decimals)),
        outputCurrencyAmount: CurrencyAmount.fromRawAmount(WETH_GOERLI, rawToTokenAmount(3, WETH_GOERLI.decimals)),
        feeAmount: CurrencyAmount.fromRawAmount(USDC_GOERLI, rawToTokenAmount(250, USDC_GOERLI.decimals)),
        marketRate: marketPrice,
        orderKind: OrderKind.SELL,
      })

      // 3 / (6000 - 250) = 0.0005217391304
      expect(amount?.toSignificant(10)).toBe('0.0005217391304')
    })
  })

  describe('When market price is greater than execution price', () => {
    const marketPrice = new Fraction(2, 1) // 2

    it('Then execution price should be marketPrice minus feeAmount', () => {
      const amount = calculateExecutionPrice({
        inputCurrencyAmount: CurrencyAmount.fromRawAmount(USDC_GOERLI, rawToTokenAmount(6000, USDC_GOERLI.decimals)),
        outputCurrencyAmount: CurrencyAmount.fromRawAmount(WETH_GOERLI, rawToTokenAmount(3, WETH_GOERLI.decimals)),
        feeAmount: CurrencyAmount.fromRawAmount(USDC_GOERLI, rawToTokenAmount(250, USDC_GOERLI.decimals)),
        marketRate: marketPrice,
        orderKind: OrderKind.SELL,
      })

      // OutputAmountByMarketRate = 6000 * 2
      // (OutputAmountByMarketRate - 250) / 6000 = 1.95833
      expect(amount?.toSignificant(10)).toBe('1.958333333')
    })
  })
})

describe('convertAmountToCurrency', () => {
  it('Original and target amounts should be represented the same as strings', () => {
    const amount = CurrencyAmount.fromRawAmount(WETH_GOERLI, rawToTokenAmount(421, WETH_GOERLI.decimals))
    const converted = convertAmountToCurrency(amount, USDC_GOERLI)

    expect(amount.toExact()).toBe('421')
    expect(converted.toExact()).toBe('421')
  })
})
