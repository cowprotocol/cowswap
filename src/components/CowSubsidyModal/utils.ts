import { BigNumber } from 'bignumber.js'
import { COW_SUBSIDY_DATA } from './constants'

const SLICED_DATA = COW_SUBSIDY_DATA.slice(1)

export function getDiscountFromBalance(balanceAtomsBn: BigNumber) {
  let tier = 0
  let [, discount] = COW_SUBSIDY_DATA[tier]
  // Here we use a sliced verison of our data without index 0 (0 amt tier)
  // because loop-wise a balance less than or equal to 0 and 100 (indices 0 and 1, respectively) are the same
  for (const [threshold, thresholdDiscount] of SLICED_DATA) {
    // Increase our tier number only if we're not at the end of our list
    // Is balance less than or equal to threshold?
    // return our subsidy information
    const thresholdBn = new BigNumber(threshold)
    if (balanceAtomsBn.lt(thresholdBn)) return { discount, tier }

    // Else assign the current discount as the threshold and iterate one tier
    discount = thresholdDiscount
    tier++
  }

  return { discount, tier }
}
