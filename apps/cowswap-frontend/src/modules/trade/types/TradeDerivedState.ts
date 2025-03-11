import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { TradeType } from './TradeType'

export interface TradeDerivedState {
  readonly inputCurrency: Currency | null
  readonly outputCurrency: Currency | null
  readonly inputCurrencyAmount: CurrencyAmount<Currency> | null
  readonly outputCurrencyAmount: CurrencyAmount<Currency> | null
  readonly inputCurrencyBalance: CurrencyAmount<Currency> | null
  readonly outputCurrencyBalance: CurrencyAmount<Currency> | null
  readonly inputCurrencyFiatAmount: CurrencyAmount<Currency> | null
  readonly outputCurrencyFiatAmount: CurrencyAmount<Currency> | null
  readonly recipient?: string | null
  readonly recipientAddress?: string | null
  readonly orderKind: OrderKind
  readonly slippage: Percent | null
  readonly tradeType: TradeType | null
  /**
   * If true, the order amount is based on a quote. Means that the order amount is calculated based on the quote.
   * For now, it's only true for Swap.
   * In Limit order price might be changed by a user.
   * In TWAP the order price depends on parts count and price protection.
   */
  readonly isQuoteBasedOrder: boolean
}

export const DEFAULT_TRADE_DERIVED_STATE: TradeDerivedState = {
  inputCurrency: null,
  outputCurrency: null,
  inputCurrencyAmount: null,
  outputCurrencyAmount: null,
  inputCurrencyBalance: null,
  outputCurrencyBalance: null,
  inputCurrencyFiatAmount: null,
  outputCurrencyFiatAmount: null,
  recipient: null,
  recipientAddress: null,
  slippage: null,
  orderKind: OrderKind.SELL,
  tradeType: null,
  isQuoteBasedOrder: false,
}
