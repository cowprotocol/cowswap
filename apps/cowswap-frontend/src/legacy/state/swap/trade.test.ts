import { DEFAULT_PRECISION, LONG_PRECISION, WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { parseUnits } from '@ethersproject/units'
import { CurrencyAmount, Fraction, Price, Currency, Percent, Token, TradeType } from '@uniswap/sdk-core'

import { stringToCurrency } from './extension'
import Trade, { _constructTradePrice } from './TradeGp'
import TradeGp from './TradeGp'

const WETH_MAINNET = new Token(ChainId.MAINNET, WETH[1].address, 18)
const DAI_MAINNET = new Token(ChainId.MAINNET, '0x6b175474e89094c44da98b954eedeac495271d0f', 18)

const SLIPPAGE_HALF_PERCENT = new Percent('5', '1000') // => 0.5%

describe('Swap PRICE Quote test', () => {
  // mocked price response for in trade
  const MOCKED_PRICE_OUT = {
    short: '4000',
    long: parseUnits('4000', DAI_MAINNET.decimals).toString(),
  }

  // movked price response for out trade
  const MOCKED_PRICE_IN = {
    short: '1',
    long: parseUnits('1', WETH_MAINNET.decimals).toString(),
  }

  const MOCKED_FEE_AMOUNT = {
    short: '0.1',
    long: parseUnits('0.1', WETH_MAINNET.decimals).toString(),
  }

  const currencyIn = CurrencyAmount.fromRawAmount(WETH_MAINNET, MOCKED_PRICE_IN.long)
  const currencyOut = CurrencyAmount.fromRawAmount(DAI_MAINNET, MOCKED_PRICE_OUT.long)

  describe('SELL', () => {
    let trade: TradeGp

    describe('1 WETH --> DAI @ 0.5% slippage', () => {
      beforeAll(() => {
        const feeAsCurrency = CurrencyAmount.fromRawAmount(WETH_MAINNET, MOCKED_FEE_AMOUNT.long)

        const executionPrice = _constructTradePrice({
          sellToken: currencyIn.subtract(feeAsCurrency),
          buyToken: currencyOut,
          kind: OrderKind.SELL,
          price: { amount: MOCKED_PRICE_OUT.long, token: DAI_MAINNET.name || 'token' },
        }) as Price<Currency, Currency>

        trade = new Trade({
          executionPrice,
          // sell orders: we show user on UI inputAmount with no fee calculation
          inputAmount: currencyIn,
          inputAmountWithoutFee: currencyIn,
          inputAmountAfterFees: currencyIn,
          inputAmountWithFee: currencyIn.subtract(feeAsCurrency),
          outputAmountWithoutFee: currencyIn,
          outputAmount: currencyOut,
          outputAmountAfterFees: currencyOut,
          fee: {
            amount: MOCKED_FEE_AMOUNT.long,
            feeAsCurrency,
          },
          tradeType: TradeType.EXACT_INPUT,
        })
      })
      it('Uses proper input amount WITHOUT fee in trade object', () => {
        // GIVEN --> User is selling 1 WETH
        // THEN --> we expect the trade inputAmount to be exactly 1 in weth atoms
        const actualInputWithFee = trade.inputAmount.quotient.toString()
        expect(actualInputWithFee).toEqual('1000000000000000000')
      })
      it('Has the correct execution price', () => {
        // WHEN --> Price_displayed = Sold_tokens / Received_tokens
        // THEN --> 900000000000000000 / 4000000000000000000000 = 0.000225
        const actualPrice = trade.executionPrice.invert().toSignificant(DEFAULT_PRECISION)
        expect(actualPrice).toEqual('0.000225')
      })
      it('Shows the proper minimumAmountOut', () => {
        // GIVEN --> An expected received amount of 4000 DAI
        // GIVEN --> Slippage of 0.5%

        // WHEN --> Calculating the minimum received amount (accounting slippage)
        // THEN --> 4000*0.995 = 3980
        const actualMinimumAmountOut = trade.minimumAmountOut(SLIPPAGE_HALF_PERCENT).toSignificant(LONG_PRECISION)
        expect(actualMinimumAmountOut).toEqual('3980')
      })
    })
  })

  describe('BUY', () => {
    let trade: TradeGp

    describe('4000 DAI --> WETH @ 0.5% slippage', () => {
      beforeAll(() => {
        const feeAsCurrency = CurrencyAmount.fromRawAmount(WETH_MAINNET, MOCKED_FEE_AMOUNT.long)

        // API response for buy order as TokenAmount
        const apiBuyPriceAsCurrency = stringToCurrency(MOCKED_PRICE_IN.long, currencyIn.currency)
        // Amount with fee added
        const apiBuyPriceAsCurrencyWithFee = apiBuyPriceAsCurrency.add(feeAsCurrency)

        const executionPrice = _constructTradePrice({
          sellToken: currencyIn,
          buyToken: currencyOut,
          kind: OrderKind.BUY,
          price: { amount: MOCKED_PRICE_IN.long, token: WETH_MAINNET.name || 'token' },
        }) as Price<Currency, Currency>

        trade = new Trade({
          executionPrice,
          // fee is in selltoken so for buy orders we set inputAmount as inputAmountWithFee
          inputAmount: apiBuyPriceAsCurrencyWithFee,
          inputAmountWithFee: apiBuyPriceAsCurrencyWithFee,
          inputAmountAfterFees: apiBuyPriceAsCurrencyWithFee,
          inputAmountWithoutFee: apiBuyPriceAsCurrency,
          outputAmount: currencyOut,
          outputAmountAfterFees: currencyOut,
          outputAmountWithoutFee: currencyOut,
          fee: {
            amount: MOCKED_FEE_AMOUNT.long,
            feeAsCurrency,
          },
          tradeType: TradeType.EXACT_OUTPUT,
        })
      })

      it('Shows correct sold amount', () => {
        // GIVEN --> Api response: price = 1000000000000000000 (1) & fee = 100000000000000000 (0.1)
        // GIVEN --> Trade FROM amount for buy orders equals ESTIMATED_SELL_AMOUNT + FEE_AMOUNT
        // THEN --> FROM = 1000000000000000000 (1) + 100000000000000000 (0.1)= 1100000000000000000 (1.1)
        const tradeSoldAmount = trade.inputAmountWithFee.quotient.toString()
        expect(tradeSoldAmount).toEqual((1100000000000000000).toString())
      })
      it('Display price correct', () => {
        const displayPrice = trade.executionPrice.invert()

        // GIVEN --> EXACT_BUY_AMOUNT = 4000000000000000000000 (4000) and
        // GIVEN --> ESTIMATED_SELL_AMOUNT_BEFORE_FEE = 1000000000000000000 (1)
        // WHEN --> PRICE_DISPLAYED = EXACT_BUY_AMOUNT / ESTIMATED_SELL_AMOUNT_BEFORE_FEE
        // THEN --> PRICE_DISPLAYED = 4000000000000000000000 (4000) / 1000000000000000000 (1) = 4000
        const tradeDisplayPrice = displayPrice.toSignificant(DEFAULT_PRECISION)
        expect(tradeDisplayPrice).toEqual('4000')
      })
      it('Price with 0.5% slippage correct', () => {
        const displayPrice = trade.executionPrice.invert()
        const userSlippage = SLIPPAGE_HALF_PERCENT
        // 0.995
        const slippage = new Fraction('1').subtract(userSlippage)

        // GIVEN 0.5% slippage & display price = 4000
        // WHEN MAX_PRICE = PRICE_DISPLAYED * (1-SLIPPAGE)
        // THEN
        const priceWithSlippage = '3980' // 4000 * 0.995
        const actualPriceWithSlipapge = slippage.multiply(displayPrice).toSignificant(12)
        expect(actualPriceWithSlipapge).toEqual(priceWithSlippage)
      })
      it('Expected maximum sold correct', () => {
        // GIVEN: An expected sell amount of 1.1 ETH   (1 ETH for the 4000 DAI, and 0.1 ETH for fee)
        // GIVEN: Slippage of 0.5%
        // WHEN: Calculate the maximum sold including slippage
        // THEN: 1.1 * 1.005
        const actualMaximumSold = trade.maximumAmountIn(SLIPPAGE_HALF_PERCENT).toSignificant(LONG_PRECISION)
        expect(actualMaximumSold).toEqual('1.1055')
      })
    })
  })
})
