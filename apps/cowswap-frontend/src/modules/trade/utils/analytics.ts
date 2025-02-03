import type { CowAnalytics } from '@cowprotocol/analytics'
import { debounce } from '@cowprotocol/common-utils'

import { CowSwapCategory } from '../../../common/analytics/types'

/**
 * Creates a debounced function for tracking trade amount changes
 * Specific to CowSwap's trade functionality
 */
export const createDebouncedTradeAmountAnalytics = (cowAnalytics: CowAnalytics) => {
  return debounce(([field, value]: [string, number]) => {
    cowAnalytics.sendEvent({
      category: CowSwapCategory.TRADE,
      action: `Change ${field} field amount`,
      value,
    })
  }, 2000)
}
