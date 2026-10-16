import { Fraction } from '@cowprotocol/currency'

// eslint-disable-next-line complexity
export function getPercentageRate(
  referenceRate: Fraction | null,
  percentage: string,
  isInverted: boolean,
): Fraction | null {
  if (!referenceRate?.greaterThan(0) || !/^(?:\d+\.?\d*|\.\d+)$/.test(percentage)) return null

  const decimals = percentage.split('.')[1]?.length ?? 0
  const percent = new Fraction(percentage.replace('.', ''), '1' + '0'.repeat(decimals))
  if (!percent.greaterThan(0) || (isInverted && !percent.lessThan(100))) return null

  const factor = isInverted ? new Fraction(100).subtract(percent) : new Fraction(100).add(percent)

  // The stored rate is output/input, so a discount on the inverted price divides the stored rate.
  return isInverted ? referenceRate.multiply(100).divide(factor) : referenceRate.multiply(factor).divide(100)
}
