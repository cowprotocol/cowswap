import { debounce } from '@cowprotocol/common-utils'

import { CowAnalytics } from './CowAnalytics'
import { Category } from './types'

export const createDebouncedTradeAmountAnalytics = (cowAnalytics: CowAnalytics) => {
  return debounce(([field, value]: [string, number]) => {
    cowAnalytics.sendEvent({
      category: Category.TRADE,
      action: `Change ${field} field amount`,
      value,
    })
  }, 2000)
}
