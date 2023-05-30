import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface TradeAmounts {
  readonly inputAmount: CurrencyAmount<Currency>
  readonly outputAmount: CurrencyAmount<Currency>
}
