import { Category, reportEvent } from './index'
import { Field } from 'state/swap/actions'
import { debounce } from 'utils/misc'

export function currencySelectAnalytics(field: Field, label: string | undefined) {
  reportEvent({
    category: Category.CURRENCY_SELECT,
    action: `Change ${field} token`,
    label,
  })
}

export function setMaxSellTokensAnalytics() {
  reportEvent({
    category: Category.SWAP,
    action: 'Set Maximun Sell Tokens',
  })
}

function _changeSwapAmountAnalytics(field: Field, value: number) {
  reportEvent({
    category: Category.SWAP,
    action: `Change ${field} field amount`,
    value,
  })
}

export const changeSwapAmountAnalytics = debounce(([field, value]: [Field, number]) => {
  _changeSwapAmountAnalytics(field, value)
}, 2000)

export function switchTokensAnalytics() {
  reportEvent({
    category: Category.SWAP,
    action: 'Switch INPUT/OUTPUT tokens',
  })
}

export function initialPriceLoadAnalytics() {
  reportEvent({
    category: Category.SWAP,
    action: 'Initial Price estimation',
  })
}
