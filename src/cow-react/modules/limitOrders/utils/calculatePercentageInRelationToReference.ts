import { FractionLike, Nullish } from '@cow/types'
import { Percent } from '@uniswap/sdk-core'
import { ZERO_FRACTION } from 'constants/index'

export type CalculateAmountPercentDifferenceProps = {
  reference: Nullish<FractionLike>
  value: Nullish<FractionLike>
}

/**
 * Helper function to calculate and return a Percent instance between 2 FractionLike instances
 *
 * It follows the formula: percentage = value*100/reference
 *
 * Example:
 * Sell amount is 100 - this is the `reference`
 * Fee amount is 5 - this is the `value`
 * The `percentage` is how much the `value` is compared to `reference`
 * percentage = 5*100/100 => 5%
 *
 *
 * @param reference
 * @param value
 */
export function calculatePercentageInRelationToReference({
  reference,
  value,
}: CalculateAmountPercentDifferenceProps): Percent | undefined {
  if (!value || !reference || reference.equalTo(ZERO_FRACTION)) {
    return undefined
  }

  const percentage = value.divide(reference)

  return new Percent(percentage.numerator, percentage.denominator)
}
