import { getInputReceiveAmountInfo, getOutputReceiveAmountInfo } from './tradeReceiveAmount'
import TradeGp from 'state/swap/TradeGp'
import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { CurrencyAmount, Price, Token, TradeType } from '@uniswap/sdk-core'

const currency = COW[SupportedChainId.MAINNET]
const currencyOut = GNO[SupportedChainId.MAINNET]
const amount = 250
const output = 250

function currencyAmount18e(currency: Token, amount: number): CurrencyAmount<Token> {
  return CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18)
}

describe('Helpers to build ReceiveAmountInfo', () => {
  describe('getInputReceiveAmountInfo()', () => {
    describe('When selling, if the fee is bigger than the traded amount', () => {
      it('Then amountBeforeFees should be zero', () => {
        const value = getInputReceiveAmountInfo(
          new TradeGp({
            inputAmount: currencyAmount18e(currency, amount),
            inputAmountWithFee: currencyAmount18e(currency, 0),
            inputAmountWithoutFee: currencyAmount18e(currency, amount),
            outputAmount: currencyAmount18e(currency, output),
            outputAmountWithoutFee: currencyAmount18e(currency, output - 3),
            fee: { feeAsCurrency: currencyAmount18e(currency, 3), amount: '5000' },
            executionPrice: new Price(currency, currencyOut, 1, 4),
            tradeType: TradeType.EXACT_INPUT,
            quoteId: 10000,
          })
        )

        expect(value.amountAfterFeesRaw.toExact()).toBe('0')
        expect({ ...value, amountAfterFeesRaw: null }).toEqual({
          amountAfterFeesRaw: null,
          amountAfterFees: '0',
          amountBeforeFees: '0',
          feeAmount: '3',
          type: 'from',
        })
      })
    })
  })

  describe('getOutputReceiveAmountInfo()', () => {
    it('Should match a snapshot', () => {
      const value = getOutputReceiveAmountInfo(
        new TradeGp({
          inputAmount: currencyAmount18e(currency, amount),
          inputAmountWithFee: currencyAmount18e(currency, 0),
          inputAmountWithoutFee: currencyAmount18e(currency, amount),
          outputAmount: currencyAmount18e(currency, output),
          outputAmountWithoutFee: currencyAmount18e(currency, output - 3),
          fee: { feeAsCurrency: currencyAmount18e(currency, 3), amount: '5000' },
          executionPrice: new Price(currency, currencyOut, 1, 4),
          tradeType: TradeType.EXACT_INPUT,
          quoteId: 10000,
        })
      )

      expect(value.amountAfterFeesRaw.toExact()).toBe('250')
      expect({ ...value, amountAfterFeesRaw: null }).toEqual({
        amountAfterFees: '250',
        amountAfterFeesRaw: null,
        amountBeforeFees: '247',
        feeAmount: '-3',
        type: 'to',
      })
    })
  })
})
