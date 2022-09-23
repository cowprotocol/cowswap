import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { COW, GNO } from 'constants/tokens'
import TradeGp from '@src/custom/state/swap/TradeGp'
import { CurrencyAmount, Price, Token, TradeType } from '@uniswap/sdk-core'

export const cowToken = COW[SupportedChainId.GOERLI]
const gnoToken = GNO[SupportedChainId.GOERLI]

interface GetTradeParams {
  sellAmount?: number
  sellToken?: Token
  buyAmount?: number
  buyToken?: Token
  fee?: number
  tradeType?: TradeType
  quoteId?: number
}

function currencyAmount18e(currency: Token, amount: number): CurrencyAmount<Token> {
  return CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18)
}

export function getTrade(params: GetTradeParams = {}) {
  const {
    sellAmount = 10,
    sellToken = gnoToken,
    buyAmount = 100,
    buyToken = cowToken,
    fee = 0.5,
    tradeType = TradeType.EXACT_INPUT,
    quoteId = 1000,
  } = params

  return new TradeGp({
    // TODO: This signature is a nightmare! It feels it has derived data. we will need to simplify it after the refactor.
    // For now Im happy to have a mock we can use in cosmos fixtures.
    inputAmount: currencyAmount18e(sellToken, sellAmount),
    inputAmountWithFee: currencyAmount18e(sellToken, sellAmount),
    inputAmountWithoutFee: currencyAmount18e(sellToken, sellAmount),
    fee: {
      amount: '1',
      feeAsCurrency: currencyAmount18e(buyToken, fee),
    },
    executionPrice: new Price(sellToken, buyToken, '100', '10'),
    tradeType,
    quoteId,
    outputAmount: currencyAmount18e(buyToken, buyAmount),
    outputAmountWithoutFee: currencyAmount18e(buyToken, buyAmount),
  })
}

export const trade: TradeGp = getTrade()
