import { CurrencyAmount, Currency } from '@uniswap/sdk-core'

export type ParsedAmounts = {
  INPUT: CurrencyAmount<Currency> | undefined
  OUTPUT: CurrencyAmount<Currency> | undefined
}
