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

describe('getAmountsForSignature()', () => {
  // 5%
  const allowedSlippage = new Percent(5, 100)
  // 3012 USDC
  const inputAmount = CurrencyAmount.fromRawAmount(USDC_MAINNET, 3012 * 10 ** USDC_MAINNET.decimals)
  // 8 USDC
  const feeAmount = CurrencyAmount.fromRawAmount(USDC_MAINNET, 8 * 10 ** USDC_MAINNET.decimals)
  // 2 WETH
  const outputAmount = CurrencyAmount.fromRawAmount(WETH_MAINNET, 2 * 10 ** WETH_MAINNET.decimals)

  describe('Given: Sell 3012 USDC for 2 WETH, with a fee of 8 USDC and slippage 5%', () => {
    describe('When partner fee is not set', () => {
      it('Then only slippage should be subtracted from output amount', () => {
        const partnerFeeBps = 0
        const trade = getTrade({
          tradeType: TradeType.EXACT_INPUT,
          inputAmount,
          outputAmount,
          feeAmount,
          partnerFeeBps,
        })

        if (!trade) throw new Error('No trade')

        const result = getAmountsForSignature({
          allowedSlippage,
          trade: trade,
          kind: OrderKind.SELL,
        })

        // Input amount remains as it is (already included fee)
        expect(result.inputAmount.toFixed()).toEqual('3012.000000')

        // outputAmount = 2 - 5% = 1.900000000000000000
        expect(result.outputAmount.toFixed()).toEqual('1.900000000000000000')
      })
    })

    describe('When partner fee is set (20%)', () => {
      const partnerFeeBps = 2000 // 20%

      it('Then both partner fee and slippage should be subtracted from output amount', () => {
        const trade = getTrade({
          tradeType: TradeType.EXACT_INPUT,
          inputAmount,
          outputAmount,
          feeAmount,
          partnerFeeBps,
        })

        if (!trade) throw new Error('No trade')

        const result = getAmountsForSignature({
          allowedSlippage,
          trade: trade,
          kind: OrderKind.SELL,
        })

        // Input amount remains as it is (already included fee)
        expect(result.inputAmount.toFixed()).toEqual('3012.000000')

        // partnerFeeAmount = 2 * 20 / 100 = 0.4
        // network fee in WETH = 0.005312084993359893
        // outputAmount = (2 - 0.4 - 0.0053) - 5% = 1.518988015978695073
        expect(result.outputAmount.toFixed()).toEqual('1.518988015978695073')
      })
    })
  })

  describe('Given: Buy 2 WETH for 3012 USDC, with a fee of 8 USDC and slippage 5%', () => {
    describe('When partner fee is not set', () => {
      it('Then network fee and slippage should be added into input amount', () => {
        const partnerFeeBps = 0
        const trade = getTrade({
          tradeType: TradeType.EXACT_OUTPUT,
          inputAmount,
          outputAmount,
          feeAmount,
          partnerFeeBps,
        })

        if (!trade) throw new Error('No trade')

        const result = getAmountsForSignature({
          allowedSlippage,
          trade: trade,
          kind: OrderKind.BUY,
        })

        // inputAmount = (3012 + 8) + 5% = 3171
        expect(result.inputAmount.toFixed()).toEqual('3171.000000')

        // Output amount remains as it is inputted
        expect(result.outputAmount.toFixed()).toEqual('2.000000000000000000')
      })
    })

    describe('When partner fee is set (20%)', () => {
      const partnerFeeBps = 2000 // 20%

      it('Then partner fee, network fee, and slippage should be added into input amount', () => {
        const trade = getTrade({
          tradeType: TradeType.EXACT_OUTPUT,
          inputAmount,
          outputAmount,
          feeAmount,
          partnerFeeBps,
        })

        if (!trade) throw new Error('No trade')

        const result = getAmountsForSignature({
          allowedSlippage,
          trade: trade,
          kind: OrderKind.BUY,
        })

        // partnerFeeAmount = 3012 * 20 / 100 = 602.4
        // inputAmount = (3012 + 602.4 + 8) + 5% = 3803.520000
        expect(result.inputAmount.toFixed()).toEqual('3803.520000')

        // Output amount remains as it is inputted
        expect(result.outputAmount.toFixed()).toEqual('2.000000000000000000')
      })
    })
  })
})
