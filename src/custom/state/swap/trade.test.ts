import { parseUnits } from '@ethersproject/units'
import { DEFAULT_PRECISION, LONG_PRECISION } from '@src/custom/constants'
import { basisPointsToPercent } from '@src/utils'
import { ChainId, Fraction, Pair, Percent, Token, TokenAmount, Trade, WETH } from '@uniswap/sdk'
import {
  stringToCurrency,
  _constructTradePrice,
  _maximumAmountInExtension,
  _minimumAmountOutExtension
} from './extension'

const WETH_MAINNET = new Token(ChainId.MAINNET, WETH[1].address, 18)
const DAI_MAINNET = new Token(ChainId.MAINNET, '0x6b175474e89094c44da98b954eedeac495271d0f', 18)

const PAIR_WETH_DAI = new Pair(
  new TokenAmount(WETH_MAINNET, parseUnits('100000000').toString()),
  new TokenAmount(DAI_MAINNET, parseUnits('400000000000').toString())
)

describe('Swap PRICE Quote test', () => {
  // mocked price response for in trade
  const MOCKED_PRICE_OUT = {
    short: '4000',
    long: parseUnits('4000', DAI_MAINNET.decimals).toString()
  }

  // movked price response for out trade
  const MOCKED_PRICE_IN = {
    short: '1',
    long: parseUnits('1', WETH_MAINNET.decimals).toString()
  }

  const MOCKED_FEE_AMOUNT = {
    short: '0.1',
    long: parseUnits('0.1', WETH_MAINNET.decimals).toString()
  }

  const currencyIn = new TokenAmount(WETH_MAINNET, MOCKED_PRICE_IN.long)
  const currencyOut = new TokenAmount(DAI_MAINNET, MOCKED_PRICE_OUT.long)

  const tradeOptions = { maxHops: 1, maxNumResults: 1 }

  describe('SELL', () => {
    let tradeSdk, trade: any

    describe('1 WETH --> DAI @ 0.5% slippage', () => {
      beforeAll(() => {
        // make a new Trade object
        tradeSdk = Trade.bestTradeExactIn([PAIR_WETH_DAI], currencyIn, currencyOut.currency, tradeOptions)[0]

        const feeAsCurrency = new TokenAmount(WETH_MAINNET, MOCKED_FEE_AMOUNT.long)

        const executionPrice = _constructTradePrice({
          sellToken: currencyIn.subtract(feeAsCurrency),
          buyToken: currencyOut,
          kind: 'sell',
          price: { amount: MOCKED_PRICE_OUT.long, token: DAI_MAINNET.name || 'token' }
        })

        console.debug('EXECUTION PRICE', executionPrice?.toSignificant(18))

        trade = {
          ...tradeSdk,
          executionPrice,
          inputAmount: tradeSdk.inputAmount.subtract(feeAsCurrency),
          inputAmountWithFee: tradeSdk.inputAmount.subtract(feeAsCurrency),
          inputAmountWithoutFee: tradeSdk.inputAmount,
          outputAmount: new TokenAmount(DAI_MAINNET, MOCKED_PRICE_OUT.long),
          maximumAmountIn(pct: Percent) {
            return _maximumAmountInExtension(pct, this)
          },
          minimumAmountOut(pct: Percent) {
            return _minimumAmountOutExtension(pct, this)
          },
          fee: {
            amount: MOCKED_FEE_AMOUNT.long,
            feeAsCurrency
          }
        }
      })
      it('Uses proper input amount WITHOUT fee in trade object', () => {
        // WHEN --> Sold_tokens => From_amount - Fee
        // THEN --> expected inputAmountMinusFee = 1 - 0.1
        const expectedInputWithFee = '900000000000000000'
        const actualInputWithFee = trade.inputAmountWithoutFee.subtract(trade.fee.feeAsCurrency)
        expect(expectedInputWithFee).toEqual(actualInputWithFee.raw.toString())
      })
      it('Has the correct execution price', () => {
        // WHEN --> Price_displayed => Sold_tokens / Received_tokens
        // THEN --> 900000000000000000 / 4000000000000000000000 = 0.000225
        const expectedPrice = '0.000225'
        const actualPrice = trade.executionPrice.invert().toSignificant(DEFAULT_PRECISION)
        expect(expectedPrice).toEqual(actualPrice)
      })
      it('Shows the proper minimumAmountOut', () => {
        // GIVEN --> slippage is set @ 0.5%
        const slippage = basisPointsToPercent(50)
        // Min_price => Price_displayed * (1+slippage)
        // Min_price_displayed = 0.000225 * (1.005) = 0.000226125

        // WHEN --> Min_received_tokens = Sold_tokens / Min_price
        // THEN --> 900000000000000000 / 0.000226125 / 10**18 = 3980.099502487562
        const expectedMinimumAmountOut = '3980.099502'
        const actualMinimumAmountOut = trade.minimumAmountOut(slippage).toSignificant(LONG_PRECISION)
        expect(expectedMinimumAmountOut).toEqual(actualMinimumAmountOut)
      })
    })
  })

  describe('BUY', () => {
    let tradeSdk, trade: any

    describe('4000 DAI --> WETH @ 0.5% slippage', () => {
      beforeAll(() => {
        // make a new Trade object
        tradeSdk = Trade.bestTradeExactOut([PAIR_WETH_DAI], currencyIn.currency, currencyOut, tradeOptions)[0]

        const feeAsCurrency = new TokenAmount(WETH_MAINNET, MOCKED_FEE_AMOUNT.long)

        // API response for buy order as TokenAmount
        const apiBuyPriceAsCurrency = stringToCurrency(MOCKED_PRICE_IN.long, currencyIn.currency)
        // Amount with fee added
        const apiBuyPriceAsCurrencyWithFee = apiBuyPriceAsCurrency.add(feeAsCurrency)

        const executionPrice = _constructTradePrice({
          sellToken: currencyIn,
          buyToken: currencyOut,
          kind: 'buy',
          price: { amount: MOCKED_PRICE_IN.long, token: WETH_MAINNET.name || 'token' }
        })

        console.debug('EXECUTION PRICE', executionPrice?.toSignificant(18))

        trade = {
          ...tradeSdk,
          executionPrice,
          inputAmount: apiBuyPriceAsCurrency,
          inputAmountWithFee: apiBuyPriceAsCurrencyWithFee,
          maximumAmountIn(pct: Percent) {
            return _maximumAmountInExtension(pct, this)
          },
          minimumAmountOut(pct: Percent) {
            return _minimumAmountOutExtension(pct, this)
          },
          fee: {
            amount: MOCKED_FEE_AMOUNT.long,
            feeAsCurrency
          }
        }
      })

      it('Shows correct sold amount', () => {
        // GIVEN --> Api response: price = 1000000000000000000 (1) & fee = 100000000000000000 (0.1)
        // WHEN --> Estimated_sold_before_fee + Fee
        // THEN --> From = 1000000000000000000 + 100000000000000000 = 1100000000000000000
        const expectedSoldAmount = 1000000000000000000 + 100000000000000000
        const actualSoldAmount = trade.inputAmountWithFee.raw.toString()
        expect(expectedSoldAmount.toString()).toEqual(actualSoldAmount)
      })
      it('Display price correct', () => {
        const displayPrice = trade.executionPrice.invert()

        // GIVEN --> To = 4000000000000000000000 & Estimated Sold Before Fee = 1000000000000000000
        // WEHN --> Price_displayed => To / Estimated_sold_before_fee
        // THEN --> Price_displayed = 4000000000000000000000 / 1000000000000000000 = 4000
        const expectedDisplayPrice = '4000'
        const actualDisplayPrice = displayPrice.toSignificant(DEFAULT_PRECISION)
        expect(expectedDisplayPrice).toEqual(actualDisplayPrice)
      })
      it('Price with 0.5% slippage correct', () => {
        const displayPrice = trade.executionPrice.invert()
        // 0.995
        const slippage = new Fraction('1').subtract(basisPointsToPercent(50))

        // GIVEN 0.5% slippage & displayPrice = 4000
        // WHEN Max_price => Price_displayed * (1-slippage)
        // THEN
        const expectedPriceWithSlippage = '3980' // 4000 * 0.995
        const actualPriceWithSlipapge = slippage.multiply(displayPrice)
        expect(expectedPriceWithSlippage).toEqual(actualPriceWithSlipapge.toSignificant(12))
      })
      it('Expected maximum sold correct', () => {
        // GIVEN To = 4000000000000000000000, MaxPrice = 3980 & Fee = 0.1
        // WHEN Maximum_sold = To / Max_price + Fee
        // THEN
        // 4000000000000000000000 / 3980 + 100000000000000000 = 1,105025125e18
        // 1,105025125e18 * 1e-18 = 1,105025125
        const expectedMaximumSold = '1.105025125'
        const actualMaximumSold = trade.maximumAmountIn(basisPointsToPercent(50)).toSignificant(LONG_PRECISION)
        expect(expectedMaximumSold).toEqual(actualMaximumSold)
      })
    })
  })
})
