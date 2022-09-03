import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { Field } from 'state/swap/actions'

export interface NewSwapPageProps {
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  allowedSlippage: Percent
  typedValue: string
  isGettingNewQuote: boolean
}

export interface TradeStateFromUrl {
  inputCurrency: string | null
  outputCurrency: string | null
  amount: string | null
  independentField: string | null
  recipient: string | null
}

export interface CurrencyInfo {
  field: Field
  currency: Currency | null
  balance: CurrencyAmount<Currency> | null
  fiatAmount: CurrencyAmount<Currency> | null
}

export interface CurrenciesBalances {
  INPUT: CurrencyAmount<Currency> | null
  OUTPUT: CurrencyAmount<Currency> | null
}
