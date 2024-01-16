import { CurrencyAmount, Currency } from '@uniswap/sdk-core'

export type ParsedAmounts = {
  INPUT: CurrencyAmount<Currency> | undefined
  OUTPUT: CurrencyAmount<Currency> | undefined
}

export interface PriceImpactTrade {
  inputAmount: CurrencyAmount<Currency> | null
  outputAmount: CurrencyAmount<Currency> | null
  inputAmountWithoutFee?: CurrencyAmount<Currency>
  outputAmountWithoutFee?: CurrencyAmount<Currency>
}

export interface FallbackPriceImpactParams {
  abTrade?: PriceImpactTrade
  isWrapping: boolean
  sellToken: string | null
  buyToken: string | null
}
