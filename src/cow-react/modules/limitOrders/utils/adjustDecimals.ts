import JSBI from 'jsbi'
import { Fraction } from '@uniswap/sdk-core'

/**
 * Consider a trade DAI (decimals 18) <-> USDC (decimals 6)
 * 1. When input is 9 DAI, the value equals 9000000000000000000
 * Then we should divide it to get value for USDC = 9000000 (6 decimals)
 *
 * 2. When input is 9 USDC, the value equals 9000000
 * Then we should multiply to get value for DAI = 9000000000000000000 (18 decimals)
 */
export function adjustDecimals(value: Fraction, prevDecimals: number, nextDecimals: number): Fraction {
  const decimalsShift = JSBI.BigInt(10 ** Math.abs(prevDecimals - nextDecimals))

  if (!JSBI.equal(decimalsShift, JSBI.BigInt(0))) {
    return prevDecimals < nextDecimals ? value.multiply(decimalsShift) : value.divide(decimalsShift)
  }

  return value
}
