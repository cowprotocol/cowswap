import { CowAnalytics } from '@cowprotocol/analytics'
import { debounce } from '@cowprotocol/common-utils'

import { Field } from 'legacy/state/types'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

/**
 * Creates a debounced function that sends analytics events for trade amount changes
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createDebouncedTradeAmountAnalytics(cowAnalytics: CowAnalytics) {
  return debounce(([field, amount]: [Field, number]) => {
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.TRADE,
      action: `Change ${field} amount`,
      value: amount,
    })
  }, 1000)
}
