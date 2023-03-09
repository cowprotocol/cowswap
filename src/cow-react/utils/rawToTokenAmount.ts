import JSBI from 'jsbi'

export function rawToTokenAmount(value: number, tokenDecimals: number): JSBI {
  return JSBI.multiply(JSBI.BigInt(value), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(tokenDecimals)))
}
