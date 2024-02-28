import { USDC_MAINNET, WETH_MAINNET } from '@cowprotocol/common-const'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'

import { buildTradeExactInWithFee, buildTradeExactOutWithFee } from 'legacy/state/swap/extension'
import TradeGp from 'legacy/state/swap/TradeGp'

import { getAmountsForSignature } from './getAmountsForSignature'

interface TradeParams {
  tradeType: TradeType
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  feeAmount: CurrencyAmount<Currency>
  partnerFeeBps: number
}

function getTrade(params: TradeParams): TradeGp | undefined {
  const { tradeType, inputAmount, outputAmount, feeAmount, partnerFeeBps } = params

  const isExactInput = tradeType === TradeType.EXACT_INPUT

  const partnerFee = {
    bps: partnerFeeBps,
    recipient: '',
  }
  const quote = {
    fee: { expirationDate: '', amount: feeAmount.quotient.toString() },
    price: {
      token: '',
      amount: isExactInput ? outputAmount.quotient.toString() : inputAmount.quotient.toString(),
      quoteId: 1,
    },
  }

  return isExactInput
    ? buildTradeExactInWithFee({
        parsedAmount: inputAmount,
        outputCurrency: outputAmount.currency,
        partnerFee,
        quote,
      })
    : buildTradeExactOutWithFee({
        parsedAmount: outputAmount,
        inputCurrency: inputAmount.currency,
        partnerFee,
        quote,
      })
}

describe.each([0, 2000 /*20%*/])('getAmountsForSignature(), partner fee bps: %i', (partnerFeeBps) => {
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
      const trade = getTrade({ tradeType: TradeType.EXACT_INPUT, inputAmount, outputAmount, feeAmount, partnerFeeBps })

      if (!trade) throw new Error('No trade')

      const result = getAmountsForSignature({
        featureFlags,
        allowedSlippage,
        trade: trade,
        kind: OrderKind.SELL,
      })

      // Just subtracted fee from inputAmount, 3012 - 8 = 3004
      expect(result.inputAmount.toFixed()).toEqual('3004.000000')

      if (partnerFeeBps === 0) {
        // outputAmount = 2 - 5% = 1.900000000000000000
        expect(result.outputAmount.toFixed()).toEqual('1.900000000000000000')
      } else {
        // outputAmount = 2 - 5% - 20% = 1.520000000000000000
        expect(result.outputAmount.toFixed()).toEqual('1.520000000000000000')
      }
    })

    /**
     * Sell amount calculated as: (inputAmount) + slippage
     * Output amount is just what user entered
     */
    it('Buy order', () => {
      const trade = getTrade({ tradeType: TradeType.EXACT_OUTPUT, inputAmount, outputAmount, feeAmount, partnerFeeBps })

      if (!trade) throw new Error('No trade')

      const result = getAmountsForSignature({
        featureFlags,
        allowedSlippage,
        trade: trade,
        kind: OrderKind.BUY,
      })

      if (partnerFeeBps === 0) {
        // inputAmount = (3012 + 8) + 5% = 3171.000000
        expect(result.inputAmount.toFixed()).toEqual('3171.000000')
      } else {
        // inputAmount = (3012 + 8) + 5% + 20% = 3805.200000
        expect(result.inputAmount.toFixed()).toEqual('3805.200000')
      }

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
      const trade = getTrade({ tradeType: TradeType.EXACT_INPUT, inputAmount, outputAmount, feeAmount, partnerFeeBps })

      if (!trade) throw new Error('No trade')

      const result = getAmountsForSignature({
        featureFlags,
        allowedSlippage,
        trade: trade,
        kind: OrderKind.SELL,
      })

      // Input amount the same, because we don't subtract fee
      expect(result.inputAmount.toFixed()).toEqual('3012.000000')

      if (partnerFeeBps === 0) {
        // outputAmount = 2 - 5% = 1.900000000000000000
        expect(result.outputAmount.toFixed()).toEqual('1.900000000000000000')
      } else {
        // outputAmount = 2 - 5% - 20% = 1.520000000000000000
        expect(result.outputAmount.toFixed()).toEqual('1.520000000000000000')
      }
    })

    /**
     * Sell amount calculated as: (inputAmount + fee) + slippage
     * Output amount is just what user entered
     */
    it('Buy order', () => {
      const trade = getTrade({ tradeType: TradeType.EXACT_OUTPUT, inputAmount, outputAmount, feeAmount, partnerFeeBps })

      if (!trade) throw new Error('No trade')

      const result = getAmountsForSignature({
        featureFlags,
        allowedSlippage,
        trade: trade,
        kind: OrderKind.BUY,
      })

      if (partnerFeeBps === 0) {
        // inputAmount = (3012 + 8) + 5% = 3171
        expect(result.inputAmount.toFixed()).toEqual('3171.000000')
      } else {
        // inputAmount = (3012 + 8) + 5% + 20% = 3805.2
        expect(result.inputAmount.toFixed()).toEqual('3805.200000')
      }

      // Output amount the same, because this is buy order
      expect(result.outputAmount.toFixed()).toEqual('2.000000000000000000')
    })
  })
})
