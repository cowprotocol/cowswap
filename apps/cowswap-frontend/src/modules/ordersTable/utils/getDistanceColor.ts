import { UI } from '@cowprotocol/ui'

import { FAIR_PRICE_THRESHOLD_PERCENTAGE, GOOD_PRICE_THRESHOLD_PERCENTAGE } from 'common/constants/common'

// Helper to determine the color based on percentage
export function getDistanceColor(percentage: number): string {
  const absPercentage = Math.abs(percentage)

  if (absPercentage <= GOOD_PRICE_THRESHOLD_PERCENTAGE) {
    return `var(${UI.COLOR_SUCCESS})` // Green - good price
  } else if (absPercentage <= FAIR_PRICE_THRESHOLD_PERCENTAGE) {
    return `var(${UI.COLOR_PRIMARY})` // Blue - fair price
  }

  return 'inherit' // Default text color for larger differences
}
