import { CurrencyAmount, Currency } from '@uniswap/sdk-core'

export type ParsedAmounts = {
  INPUT: CurrencyAmount<Currency> | undefined
  OUTPUT: CurrencyAmount<Currency> | undefined
}

// const isExactIn: boolean = independentField === Field.INPUT
// const feeAsCurrency = stringToCurrency(quote.fee.amount, inputCurrency)
// const inputAmountWithoutFee = stringToCurrency(quote.price.amount, inputCurrency)
// const inputAmountWithFee = inputAmountWithoutFee.add(feeAsCurrency)
// const outputAmount = stringToCurrency(quote.price.amount, outputCurrency)

export interface PriceImpactTrade {
  inputAmount: CurrencyAmount<Currency> | null // isExactIn ? parsedInputAmount : inputAmountWithFee
  outputAmount: CurrencyAmount<Currency> | null // isExactIn ? stringToCurrency(quote.price.amount, outputCurrency) : parsedInputAmount
  inputAmountWithoutFee?: CurrencyAmount<Currency> // isExactIn ? parsedInputAmount : inputAmountWithoutFee
  outputAmountWithoutFee?: CurrencyAmount<Currency> // isExactIn ? stringToCurrency(quote.price.amount, outputCurrency) (???) : parsedInputAmount
}

export interface FallbackPriceImpactParams {
  abTrade?: PriceImpactTrade
  isWrapping: boolean
  sellToken: string | null
  buyToken: string | null
}
