import { CowAnalytics } from '@cowprotocol/analytics'
import { debounce } from '@cowprotocol/common-utils'

import { Field } from 'legacy/state/types'

import { CowSwapCategory } from './types'

/**
 * Creates a debounced function that sends analytics events for trade amount changes
 */
export function createDebouncedTradeAmountAnalytics(cowAnalytics: CowAnalytics) {
  return debounce(([field, amount]: [Field, number]) => {
    cowAnalytics.sendEvent({
      category: CowSwapCategory.TRADE,
      action: `Change ${field} amount`,
      value: amount,
    })
  }, 1000)
}
