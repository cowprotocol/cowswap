import { getInputReceiveAmountInfo, getOutputReceiveAmountInfo } from './tradeReceiveAmount'
import TradeGp from 'state/swap/TradeGp'
import { COW, GNO } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'
import { CurrencyAmount, Price, TradeType } from '@uniswap/sdk-core'

const currency = COW[SupportedChainId.MAINNET]
const currencyOut = GNO[SupportedChainId.MAINNET]
const amount = 250
const output = 250

describe('Helpers to build ReceiveAmountInfo', () => {
  describe('getInputReceiveAmountInfo()', () => {
    describe('When tradeType is EXACT_INPUT and inputAmountWithFee less than trade fee amount', () => {
      it('Then amountBeforeFees should be zero', () => {
        const value = getInputReceiveAmountInfo(
          new TradeGp({
            inputAmount: CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18),
            inputAmountWithFee: CurrencyAmount.fromRawAmount(currency, 0),
            inputAmountWithoutFee: CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18),
            outputAmount: CurrencyAmount.fromRawAmount(currency, output * 10 ** 18),
            outputAmountWithoutFee: CurrencyAmount.fromRawAmount(currency, (output - 3) * 10 ** 18),
            fee: { feeAsCurrency: CurrencyAmount.fromRawAmount(currency, 3 * 10 ** 18), amount: '5000' },
            executionPrice: new Price(currency, currencyOut, 1, 4),
            tradeType: TradeType.EXACT_INPUT,
            quoteId: 10000,
          })
        )

        expect(value).toMatchSnapshot()
        expect(value.amountBeforeFees).toBe('0')
      })
    })
  })

  describe('getOutputReceiveAmountInfo()', () => {
    it('Should match a snapshot', () => {
      const value = getOutputReceiveAmountInfo(
        new TradeGp({
          inputAmount: CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18),
          inputAmountWithFee: CurrencyAmount.fromRawAmount(currency, 0),
          inputAmountWithoutFee: CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18),
          outputAmount: CurrencyAmount.fromRawAmount(currency, output * 10 ** 18),
          outputAmountWithoutFee: CurrencyAmount.fromRawAmount(currency, (output - 3) * 10 ** 18),
          fee: { feeAsCurrency: CurrencyAmount.fromRawAmount(currency, 3 * 10 ** 18), amount: '5000' },
          executionPrice: new Price(currency, currencyOut, 1, 4),
          tradeType: TradeType.EXACT_INPUT,
          quoteId: 10000,
        })
      )

      expect(value).toMatchSnapshot()
    })
  })
})
