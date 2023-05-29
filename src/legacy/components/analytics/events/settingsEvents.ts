import { debounce } from 'legacy/utils/misc'

import { sendEvent } from '../index'
import { Category } from '../types'

export function toggleExpertModeAnalytics(enable: boolean) {
  sendEvent({
    category: Category.EXPERT_MODE,
    action: `${enable ? 'Enable' : 'Disable'} Expert Mode`,
  })
}

export function showExpertModeConfirmationAnalytics() {
  sendEvent({
    category: Category.EXPERT_MODE,
    action: 'Show Confirmation',
  })
}

export function toggleRecepientAddressAnalytics(enable: boolean) {
  sendEvent({
    category: Category.RECIPIENT_ADDRESS,
    action: 'Toggle Recipient Address',
    label: enable ? 'Enabled' : 'Disabled',
  })
}

export function searchByAddressAnalytics(isAddressSearch: string) {
  sendEvent({
    category: Category.CURRENCY_SELECT,
    action: 'Search by address',
    label: isAddressSearch,
  })
}

type SlipageToleranceType = 'Custom' | 'Default'
function _slippageToleranceAnalytics(type: SlipageToleranceType, value: number) {
  sendEvent({
    category: Category.ORDER_SLIPAGE_TOLERANCE,
    action: `Set ${type} Slipage Tolerance`,
    value,
  })
}

export const slippageToleranceAnalytics = debounce(([action, value]: [SlipageToleranceType, number]) => {
  _slippageToleranceAnalytics(action, value)
}, 2000)
