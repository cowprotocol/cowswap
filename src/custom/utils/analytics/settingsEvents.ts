import { Category, reportEvent } from './index'
import { debounce } from 'utils/misc'

export function toggleExpertModeAnalytics(enable: boolean) {
  reportEvent({
    category: Category.EXPERT_MODE,
    action: `${enable ? 'Enable' : 'Disable'} Expert Mode`,
  })
}

export function showExpertModeConfirmationAnalytics() {
  reportEvent({
    category: Category.EXPERT_MODE,
    action: 'Show Confirmation',
  })
}

export function toggleRecepientAddressAnalytics(enable: boolean) {
  reportEvent({
    category: Category.RECIPIENT_ADDRESS,
    action: 'Toggle Recipient Address',
    label: enable ? 'Enabled' : 'Disabled',
  })
}

export function searchByAddressAnalytics(isAddressSearch: string) {
  reportEvent({
    category: Category.CURRENCY_SELECT,
    action: 'Search by address',
    label: isAddressSearch,
  })
}

type SlipageToleranceType = 'Custom' | 'Default'
function _slippageToleranceAnalytics(type: SlipageToleranceType, value: number) {
  reportEvent({
    category: Category.ORDER_SLIPAGE_TOLERANCE,
    action: `Set ${type} Slipage Tolerance`,
    value,
  })
}

export const slippageToleranceAnalytics = debounce(([action, value]: [SlipageToleranceType, number]) => {
  _slippageToleranceAnalytics(action, value)
}, 2000)
