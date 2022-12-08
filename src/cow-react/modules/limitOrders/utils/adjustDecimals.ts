import JSBI from 'jsbi'
import { Fraction } from '@uniswap/sdk-core'

export function adjustDecimals(value: Fraction, prevDecimals: number, nextDecimals: number): Fraction {
  const decimalsShift = JSBI.BigInt(10 ** Math.abs(prevDecimals - nextDecimals))

  if (!JSBI.equal(decimalsShift, JSBI.BigInt(0))) {
    return prevDecimals < nextDecimals ? value.multiply(decimalsShift) : value.divide(decimalsShift)
  }

  return value
}
