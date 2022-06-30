import { Category, _reportEvent } from './index'
import { Field } from 'state/swap/actions'
import { debounce } from 'utils/misc'

export function currencySelectAnalytics(field: Field, label: string | undefined) {
  _reportEvent({
    category: Category.CURRENCY_SELECT,
    action: `Change ${field} token`,
    label,
  })
}

export function setMaxSellTokensAnalytics() {
  _reportEvent({
    category: Category.SWAP,
    action: 'Set Maximun Sell Tokens',
  })
}

export function _changeSwapAmountAnalytics(field: Field, value: number) {
  _reportEvent({
    category: Category.SWAP,
    action: `Change ${field} field amount`,
    value,
  })
}

export const changeSwapAmountAnalytics = debounce(([field, value]: [Field, number]) => {
  _changeSwapAmountAnalytics(field, value)
}, 2000)

export function switchTokensAnalytics() {
  _reportEvent({
    category: Category.SWAP,
    action: 'Switch INPUT/OUTPUT tokens',
  })
}

export function initialPriceLoadAnalytics() {
  _reportEvent({
    category: Category.SWAP,
    action: 'Initial Price estimation',
  })
}
