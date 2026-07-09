/**
 * Returns the gas value plus a margin for unexpected or variable gas costs
 * @param value the gas value to pad
 */
export function calculateGasMargin(value: bigint): bigint {
  return (value * 120n) / 100n
}
