import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import JSBI from 'jsbi'
import { ONE_FRACTION } from 'constants/misc'

export function calculateSlippageAmount(value: CurrencyAmount<Currency>, slippage: Percent): [JSBI, JSBI] {
  if (slippage.lessThan(0) || slippage.greaterThan(ONE_FRACTION)) throw new Error('Unexpected slippage')
  return [value.multiply(ONE_FRACTION.subtract(slippage)).quotient, value.multiply(ONE_FRACTION.add(slippage)).quotient]
}
