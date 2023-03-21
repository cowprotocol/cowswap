import { FractionLike, Nullish } from '@cow/types'
import { Percent } from '@uniswap/sdk-core'

export type CalculateAmountPercentDifferenceProps = {
  reference: Nullish<FractionLike>
  delta: Nullish<FractionLike>
}

/**
 * Helper function to calculate and return a Percent instance between 2 FractionLike instances
 *
 * @param reference
 * @param delta
 */
export function calculateFractionLikePercentDifference({
  reference,
  delta,
}: CalculateAmountPercentDifferenceProps): Percent | undefined {
  if (!reference || !delta) {
    return undefined
  }

  const percentage = reference.divide(delta)

  return new Percent(percentage.numerator, percentage.denominator)
}
