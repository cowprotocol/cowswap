import { Category, _reportEvent } from './index'
import { debounce } from 'utils/misc'

export function toggleExpertModeAnalytics(enable: boolean) {
  _reportEvent({
    category: Category.EXPERT_MODE,
    action: `${enable ? 'Enable' : 'Disable'} Expert Mode`,
  })
}

export function showExpertModeConfirmationAnalytics() {
  _reportEvent({
    category: Category.EXPERT_MODE,
    action: 'Show Confirmation',
  })
}

export function toggleRecepientAddressAnalytics(isDisabling: boolean) {
  _reportEvent({
    category: Category.RECIPIENT_ADDRESS,
    action: 'Toggle Recipient Address',
    label: !isDisabling ? 'Enabled' : 'Disabled',
  })
}

export function searchByAddressAnalytics(isAddressSearch: string) {
  _reportEvent({
    category: Category.CURRENCY_SELECT,
    action: 'Search by address',
    label: isAddressSearch,
  })
}

type SlipageToleranceAction = 'Custom' | 'Default'
function _slippageToleranceAnalytics(action: SlipageToleranceAction, value: number) {
  _reportEvent({
    category: Category.ORDER_SLIPAGE_TOLERANCE,
    action: `Set ${action} Slipage Tolerance`,
    value,
  })
}

export const slippageToleranceAnalytics = debounce(([action, value]: [SlipageToleranceAction, number]) => {
  _slippageToleranceAnalytics(action, value)
}, 2000)
