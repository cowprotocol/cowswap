import { debounce } from '@cowprotocol/common-utils'

import { sendEvent } from '../googleAnalytics'
import { Category } from '../types'

export function currencySelectAnalytics(field: string, label: string | undefined) {
  sendEvent({
    category: Category.CURRENCY_SELECT,
    action: `Change ${field} token`,
    label,
  })
}

export function setMaxSellTokensAnalytics() {
  sendEvent({
    category: Category.TRADE,
    action: 'Set Maximun Sell Tokens',
  })
}

function _changeSwapAmountAnalytics(field: string, value: number) {
  sendEvent({
    category: Category.TRADE,
    action: `Change ${field} field amount`,
    value,
  })
}

export const changeSwapAmountAnalytics = debounce(([field, value]: [string, number]) => {
  _changeSwapAmountAnalytics(field, value)
}, 2000)

export function switchTokensAnalytics() {
  sendEvent({
    category: Category.TRADE,
    action: 'Switch INPUT/OUTPUT tokens',
  })
}

export function initialPriceLoadAnalytics() {
  sendEvent({
    category: Category.TRADE,
    action: 'Initial Price estimation',
  })
}
