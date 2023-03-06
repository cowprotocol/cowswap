import { Field } from 'state/swap/actions'
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
 * Consider a trade DAI (decimals 18) <-> USDC (decimals 6)
 * 1. When input is 9 DAI, the value equals 9000000000000000000
 * Then we should divide it to get value for USDC = 9000000 (6 decimals)
 *
 * 2. When input is 9 USDC, the value equals 9000000
 * Then we should multiply to get value for DAI = 9000000000000000000 (18 decimals)
 */
function adjustDecimals(value: Fraction, prevDecimals: number, nextDecimals: number): Fraction {
  if (prevDecimals === nextDecimals) {
    return value
  }

  const decimalsShift = JSBI.BigInt(
    JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(Math.abs(prevDecimals - nextDecimals)))
  )

  return prevDecimals < nextDecimals ? value.multiply(decimalsShift) : value.divide(decimalsShift)
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
