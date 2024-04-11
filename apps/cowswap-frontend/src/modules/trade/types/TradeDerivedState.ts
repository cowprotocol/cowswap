import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { TradeType } from '../hooks/useTradeTypeInfo'

export interface TradeDerivedState {
  readonly inputCurrency: Currency | null
  readonly outputCurrency: Currency | null
  readonly inputCurrencyAmount: CurrencyAmount<Currency> | null
  readonly outputCurrencyAmount: CurrencyAmount<Currency> | null
  /**
   * Since Cow Protocol supports buying trade type
   * Sometimes we need a maximum amount to sell
   *
   * How it works:
   * You want to buy exactly 2 WETH for <some amount> of COW.
   * In this case, you will input 2 WETH in the buy input
   * and the sell input will be automatically filled by the quote API response, for example with the value 552 COW.
   * Since the market is liquid, there might be a slippage, let's assume it's 2%.
   * So, the final sell amount will be 552 COW + 2% = 563.04
   */
  readonly slippageAdjustedSellAmount: CurrencyAmount<Currency> | null
  readonly slippageAdjustedBuyAmount: CurrencyAmount<Currency> | null
  readonly inputCurrencyBalance: CurrencyAmount<Currency> | null
  readonly outputCurrencyBalance: CurrencyAmount<Currency> | null
  readonly inputCurrencyFiatAmount: CurrencyAmount<Currency> | null
  readonly outputCurrencyFiatAmount: CurrencyAmount<Currency> | null
  readonly recipient: string | null
  readonly recipientAddress: string | null
  readonly orderKind: OrderKind
  readonly tradeType: TradeType | null
}

export const DEFAULT_TRADE_DERIVED_STATE: TradeDerivedState = {
  inputCurrency: null,
  outputCurrency: null,
  inputCurrencyAmount: null,
  outputCurrencyAmount: null,
  slippageAdjustedSellAmount: null,
  slippageAdjustedBuyAmount: null,
  inputCurrencyBalance: null,
  outputCurrencyBalance: null,
  inputCurrencyFiatAmount: null,
  outputCurrencyFiatAmount: null,
  recipient: null,
  recipientAddress: null,
  orderKind: OrderKind.SELL,
  tradeType: null,
}
