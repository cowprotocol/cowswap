import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { OrderKind } from '@cowprotocol/cow-sdk'

export interface TradeDerivedState {
  readonly inputCurrency: Currency | null
  readonly outputCurrency: Currency | null
  readonly inputCurrencyAmount: CurrencyAmount<Currency> | null
  readonly outputCurrencyAmount: CurrencyAmount<Currency> | null
  readonly inputCurrencyBalance: CurrencyAmount<Currency> | null
  readonly outputCurrencyBalance: CurrencyAmount<Currency> | null
  readonly inputCurrencyFiatAmount: CurrencyAmount<Currency> | null
  readonly outputCurrencyFiatAmount: CurrencyAmount<Currency> | null
  readonly recipient: string | null
  readonly orderKind: OrderKind
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
  orderKind: OrderKind.SELL,
}
