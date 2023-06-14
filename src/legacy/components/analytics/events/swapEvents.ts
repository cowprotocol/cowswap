import { Field } from 'legacy/state/swap/actions'
import { debounce } from 'legacy/utils/misc'

import { sendEvent } from '../index'
import { Category } from '../types'

export function currencySelectAnalytics(field: Field, label: string | undefined) {
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

function _changeSwapAmountAnalytics(field: Field, value: number) {
  sendEvent({
    category: Category.TRADE,
    action: `Change ${field} field amount`,
    value,
  })
}

export const changeSwapAmountAnalytics = debounce(([field, value]: [Field, number]) => {
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
