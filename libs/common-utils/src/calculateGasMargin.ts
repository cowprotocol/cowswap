import { BigNumber } from '@ethersproject/bignumber'

/**
 * Returns the gas value plus a margin for unexpected or variable gas costs
 * @param value the gas value to pad
 */
export function calculateGasMargin<T extends bigint | BigNumber>(value: T): T {
  if (typeof value === 'bigint') {
    return ((value * 120n) / 100n) as T
  } else {
    return value.mul(120).div(100) as T
  }
}
