import { Field } from 'legacy/state/swap/actions'
import { Currency, Fraction } from '@uniswap/sdk-core'
import JSBI from 'jsbi'

export type RateCalculationParams = {
  amount: Fraction | null
  activeRate: Fraction | null
  field: Field
  inputCurrency: Currency | null
  outputCurrency: Currency | null
}

/**
 * Adjust a fraction defined in units for both token to consider the decimals.
 * For example, a fraction like 1.1/1 representing the price of USDC, DAI in units, will be turned into
 * 1.1/1000000000000 in atoms
 */
export function adjustDecimalsAtoms(value: Fraction, decimalsA: number, decimalsB: number): Fraction {
  if (decimalsA === decimalsB) {
    return value
  }

  const decimalsShift = JSBI.BigInt(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(Math.abs(decimalsA - decimalsB))))

  return decimalsA < decimalsB ? value.multiply(decimalsShift) : value.divide(decimalsShift)
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

  const parsedValue = adjustDecimalsAtoms(
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
