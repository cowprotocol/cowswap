import { FractionUtils } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

export type RateCalculationParams = {
  amount: CurrencyAmount<Currency> | null
  activeRate: Fraction | null
  field: Field
  inputCurrency: Currency | null
  outputCurrency: Currency | null
}

export function calculateAmountForRate({
  activeRate,
  amount,
  field,
  inputCurrency,
  outputCurrency,
}: RateCalculationParams): CurrencyAmount<Currency> | null {
  if (!amount || amount.equalTo(0) || !activeRate || activeRate.equalTo(0) || !inputCurrency || !outputCurrency) {
    return null
  }

  const { decimals: inputDecimals } = inputCurrency
  const { decimals: outputDecimals } = outputCurrency

  const parsedValue = FractionUtils.adjustDecimalsAtoms(
    amount,
    field === Field.INPUT ? inputDecimals : outputDecimals,
    field === Field.INPUT ? outputDecimals : inputDecimals
  )

  if (field === Field.INPUT) {
    return CurrencyAmount.fromRawAmount(outputCurrency, parsedValue.multiply(activeRate).quotient)
  }

  if (field === Field.OUTPUT) {
    return CurrencyAmount.fromRawAmount(inputCurrency, parsedValue.divide(activeRate).quotient)
  }

  return null
}
