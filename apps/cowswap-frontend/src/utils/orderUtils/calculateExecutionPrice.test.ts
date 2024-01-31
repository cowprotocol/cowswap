import { USDC_SEPOLIA, WETH_SEPOLIA } from '@cowprotocol/common-const'
import { rawToTokenAmount } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/contracts'
import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'

import { calculateExecutionPrice, convertAmountToCurrency } from './calculateExecutionPrice'

describe('calculateExecutionPrice', () => {
  describe('When market price is less than execution price', () => {
    const marketPrice = new Fraction(3, 7000) // 0

    it('When fee is zero then the result must be just output / input', () => {
      const amount = calculateExecutionPrice({
        inputCurrencyAmount: CurrencyAmount.fromRawAmount(USDC_SEPOLIA, rawToTokenAmount(6000, USDC_SEPOLIA.decimals)),
        outputCurrencyAmount: CurrencyAmount.fromRawAmount(WETH_SEPOLIA, rawToTokenAmount(3, WETH_SEPOLIA.decimals)),
        feeAmount: CurrencyAmount.fromRawAmount(USDC_SEPOLIA, rawToTokenAmount(0, USDC_SEPOLIA.decimals)),
        marketRate: marketPrice,
        orderKind: OrderKind.SELL,
      })

      // GIVEN: Sell 6000 USDC for 3 WETH (limit price = 0.0005)
      // GIVEN: Fee 0 USDC
      // THEN: Execution Price = 3 / (6000 - 0) = 0.0005
      expect(amount?.toSignificant(10)).toBe('0.0005')
    })

    it('The fee must be subtracted from the execution price', () => {
      const amount = calculateExecutionPrice({
        inputCurrencyAmount: CurrencyAmount.fromRawAmount(USDC_SEPOLIA, rawToTokenAmount(6000, USDC_SEPOLIA.decimals)),
        outputCurrencyAmount: CurrencyAmount.fromRawAmount(WETH_SEPOLIA, rawToTokenAmount(3, WETH_SEPOLIA.decimals)),
        feeAmount: CurrencyAmount.fromRawAmount(USDC_SEPOLIA, rawToTokenAmount(250, USDC_SEPOLIA.decimals)),
        marketRate: marketPrice,
        orderKind: OrderKind.SELL,
      })

      // GIVEN: Sell 6000 USDC for 3 WETH (limit price = 0.0005)
      // GIVEN: Fee 250 USDC
      // THEN: Execution Price = 3 / (6000 - 250) = 0.0005217391304
      expect(amount?.toSignificant(10)).toBe('0.0005217391304')
    })
  })

  describe('When market price is greater than execution price', () => {
    const marketPrice = new Fraction(10, 1) // 10

    it('Then execution price should be marketPrice', () => {
      const amount = calculateExecutionPrice({
        inputCurrencyAmount: CurrencyAmount.fromRawAmount(USDC_SEPOLIA, rawToTokenAmount(6000, USDC_SEPOLIA.decimals)),
        outputCurrencyAmount: CurrencyAmount.fromRawAmount(
          WETH_SEPOLIA,
          rawToTokenAmount(30000, WETH_SEPOLIA.decimals)
        ),
        feeAmount: CurrencyAmount.fromRawAmount(USDC_SEPOLIA, rawToTokenAmount(250, USDC_SEPOLIA.decimals)),
        marketRate: marketPrice,
        orderKind: OrderKind.SELL,
      })

      // GIVEN: Sell 6000 USDC for 30000 WETH (limit price = 5)
      // GIVEN: Fee 250 USDC
      // GIVEN: Market price = 10
      // THEN: Est. execution price = 30000 / (6000 - 250) = 5.217
      // WHEN: Market price is greater than Est. execution price
      // THEN: Execution Price should be Market price minus fee
      // THEN: Execution Price = ((6000 - 250)) * 10 / 6000 = 9.583
      expect(amount?.toSignificant(10)).toBe('9.583333333')
    })
  })
})

describe('convertAmountToCurrency', () => {
  it('Original and target amounts should be represented the same as strings', () => {
    const amount = CurrencyAmount.fromRawAmount(WETH_SEPOLIA, rawToTokenAmount(421, WETH_SEPOLIA.decimals))
    const converted = convertAmountToCurrency(amount, USDC_SEPOLIA)

    expect(amount.toExact()).toBe('421')
    expect(converted.toExact()).toBe('421')
  })
})
