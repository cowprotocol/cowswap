import { USDC_MAINNET, WETH_MAINNET } from '@cowprotocol/common-const'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent, Price, TradeType } from '@uniswap/sdk-core'

import TradeGp from 'legacy/state/swap/TradeGp'

import { getAmountsForSignature } from './getAmountsForSignature'

interface TradeParams {
  tradeType: TradeType
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  feeAmount: CurrencyAmount<Currency>
}

function getTrade(params: TradeParams): TradeGp {
  const { tradeType, inputAmount, outputAmount, feeAmount } = params

  const isExactInput = tradeType === TradeType.EXACT_INPUT

  const executionPrice = new Price({
    baseAmount: inputAmount,
    quoteAmount: outputAmount,
  })

  return new TradeGp({
    inputAmount,
    inputAmountWithFee: isExactInput ? inputAmount.subtract(feeAmount) : inputAmount.add(feeAmount),
    inputAmountWithoutFee: inputAmount,
    outputAmount: isExactInput ? outputAmount.subtract(executionPrice.quote(feeAmount)) : outputAmount,
    outputAmountWithoutFee: outputAmount,
    fee: { feeAsCurrency: feeAmount, amount: feeAmount.toFixed() },
    executionPrice,
    tradeType,
    quoteId: 1,
  })
}

describe('getAmountsForSignature()', () => {
  // 5%
  const allowedSlippage = new Percent(5, 100)
  // 3012 USDC
  const inputAmount = CurrencyAmount.fromRawAmount(USDC_MAINNET, 3012 * 10 ** USDC_MAINNET.decimals)
  // 8 USDC
  const feeAmount = CurrencyAmount.fromRawAmount(USDC_MAINNET, 8 * 10 ** USDC_MAINNET.decimals)
  // 2 WETH
  const outputAmount = CurrencyAmount.fromRawAmount(WETH_MAINNET, 2 * 10 ** WETH_MAINNET.decimals)

  describe('With fee > 0', () => {
    // Fee=zero is disabled
    const featureFlags = { swapZeroFee: false }

    /**
     * Sell amount is just what user entered minus fee
     * Output amount is calculated as: (outputAmount - fee) - slippage
     */
    it('Sell order', () => {
      const trade = getTrade({ tradeType: TradeType.EXACT_INPUT, inputAmount, outputAmount, feeAmount })

      const result = getAmountsForSignature({
        featureFlags,
        allowedSlippage,
        trade: trade,
        kind: OrderKind.SELL,
      })

      // Just subtracted fee from inputAmount, 3012 - 8 = 3004
      expect(result.inputAmount.toFixed()).toEqual('3004.000000')

      // Fee in WETH = 0.005312084993359893
      // outputAmount = (2 - 0.005312) - 5% = 1.89495
      expect(result.outputAmount.toFixed()).toEqual('1.894953519256308100')
    })

    /**
     * Sell amount calculated as: (inputAmount + fee) + slippage
     * Output amount is just what user entered
     */
    it('Buy order', () => {
      const trade = getTrade({ tradeType: TradeType.EXACT_OUTPUT, inputAmount, outputAmount, feeAmount })

      const result = getAmountsForSignature({
        featureFlags,
        allowedSlippage,
        trade: trade,
        kind: OrderKind.BUY,
      })

      // inputAmount = (3012 + 8) + 5% = 3171.000000
      expect(result.inputAmount.toFixed()).toEqual('3171.000000')
      // Output amount the same, because this is buy order
      expect(result.outputAmount.toFixed()).toEqual('2.000000000000000000')
    })
  })

  describe('With fee = 0', () => {
    // Fee=zero is enabled
    const featureFlags = { swapZeroFee: true }

    /**
     * Sell amount is just what user entered
     * Output amount calculated as: outputAmount - slippage
     */
    it('Sell order', () => {
      const trade = getTrade({ tradeType: TradeType.EXACT_INPUT, inputAmount, outputAmount, feeAmount })

      const result = getAmountsForSignature({
        featureFlags,
        allowedSlippage,
        trade: trade,
        kind: OrderKind.SELL,
      })

      // Input amount the same, because we don't subtract fee
      expect(result.inputAmount.toFixed()).toEqual('3012.000000')

      // outputAmount = 2 - 5% = 1.894953
      expect(result.outputAmount.toFixed()).toEqual('1.894953519256308100')
    })

    /**
     * Sell amount calculated as: inputAmount + slippage
     * Output amount is just what user entered
     */
    it('Buy order', () => {
      const trade = getTrade({ tradeType: TradeType.EXACT_OUTPUT, inputAmount, outputAmount, feeAmount })

      const result = getAmountsForSignature({
        featureFlags,
        allowedSlippage,
        trade: trade,
        kind: OrderKind.BUY,
      })

      // inputAmount = 3012 + 5% = 3162.600000
      expect(result.inputAmount.toFixed()).toEqual('3162.600000')

      // Output amount the same, because this is buy order
      expect(result.outputAmount.toFixed()).toEqual('2.000000000000000000')
    })
  })
})
