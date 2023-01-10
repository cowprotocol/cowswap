import { Field } from 'state/swap/actions'
import { Currency, Fraction } from '@uniswap/sdk-core'
import { adjustDecimals } from '@cow/modules/limitOrders/utils/adjustDecimals'

export type RateCalculationParams = {
  amount: Fraction | null
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
}: RateCalculationParams): Fraction | null {
  if (!amount || amount.equalTo(0) || !activeRate || activeRate.equalTo(0) || !inputCurrency || !outputCurrency) {
    return null
  }

  const { decimals: inputDecimals } = inputCurrency
  const { decimals: outputDecimals } = outputCurrency

  const parsedValue = adjustDecimals(
    amount,
    field === Field.INPUT ? inputDecimals : outputDecimals,
    field === Field.INPUT ? outputDecimals : inputDecimals
  )

  if (field === Field.INPUT) {
    return parsedValue.multiply(activeRate)
  }

  if (field === Field.OUTPUT) {
    return parsedValue.divide(activeRate)
  }

  return null
}
