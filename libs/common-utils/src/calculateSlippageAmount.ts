import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

const ONE_FRACTION = new Fraction(1, 1)

export function calculateSlippageAmount(value: CurrencyAmount<Currency>, slippage: Percent): [JSBI, JSBI] {
  if (slippage.lessThan(0) || slippage.greaterThan(ONE_FRACTION)) throw new Error('Unexpected slippage')
  return [value.multiply(ONE_FRACTION.subtract(slippage)).quotient, value.multiply(ONE_FRACTION.add(slippage)).quotient]
}
