import { Fraction } from '@cowprotocol/currency'

const MIN_PERCENTAGE = new Fraction(1, 100)
const MAX_PERCENTAGE = new Fraction(99999, 100)
const MAX_INVERTED_PERCENTAGE = new Fraction(9999, 100)

// eslint-disable-next-line complexity
export function getPercentageRate(
  referenceRate: Fraction | null,
  percentage: string,
  isInverted: boolean,
): Fraction | null {
  if (!referenceRate?.greaterThan(0) || !/^(?:\d+\.?\d*|\.\d+)$/.test(percentage)) return null

  const decimals = percentage.split('.')[1]?.length ?? 0
  const percent = new Fraction(percentage.replace('.', ''), '1' + '0'.repeat(decimals))
  if (percent.lessThan(MIN_PERCENTAGE) || percent.greaterThan(isInverted ? MAX_INVERTED_PERCENTAGE : MAX_PERCENTAGE)) {
    return null
  }

  const factor = isInverted ? new Fraction(100).subtract(percent) : new Fraction(100).add(percent)

  // The stored rate is output/input, so a discount on the inverted price divides the stored rate.
  return isInverted ? referenceRate.multiply(100).divide(factor) : referenceRate.multiply(factor).divide(100)
}

export function getRatePercentage(
  referenceRate: Fraction | null,
  rate: Fraction | null,
  isInverted: boolean,
): string | null {
  if (!referenceRate?.greaterThan(0) || !rate?.greaterThan(0)) return null

  // Inverse of getPercentageRate: rate = ref * (100 + p) / 100, or rate = ref * 100 / (100 - p) when inverted
  const percent = isInverted
    ? new Fraction(100).subtract(referenceRate.multiply(100).divide(rate))
    : rate.multiply(100).divide(referenceRate).subtract(100)
  const maxPercent = isInverted ? MAX_INVERTED_PERCENTAGE : MAX_PERCENTAGE
  const roundedPercent = (percent.greaterThan(maxPercent) ? maxPercent : percent).toFixed(2)
  if (Number(roundedPercent) < Number(MIN_PERCENTAGE.toFixed(2))) return null

  return roundedPercent.replace(/\.?0+$/, '')
}
