import { Category } from '../types'
import { _reportEvent } from '../utils'
import { debounce } from 'utils/misc'

const types = {
  expertMode: {
    toggle: {
      enable: 'Enable Expert Mode',
      disable: 'Disable Expert Mode',
    },
    confirmation: 'Show Confirmation',
  },
  recipient: 'Toggle Recipient Address',
  search: 'Search by address',
  slippageTolerance: {
    custom: 'Set Custom Slippage Tolerance',
    default: 'Set Default Slippage Tolerance',
  },
}

type toggleExpertModeType = keyof typeof types.expertMode.toggle
export function toggleExpertModeAnalytics(option: toggleExpertModeType) {
  _reportEvent({
    category: Category.EXPERT_MODE,
    action: types.expertMode.toggle[option],
  })
}

export function showExpertModeConfirmationAnalytics() {
  _reportEvent({
    category: Category.EXPERT_MODE,
    action: types.expertMode.confirmation,
  })
}

export function toggleRecepientAddressAnalytics(isDisabling: boolean) {
  _reportEvent({
    category: Category.RECIPIENT_ADDRESS,
    action: types.recipient,
    label: !isDisabling ? 'Enabled' : 'Disabled',
  })
}

export function searchByAddressAnalytics(isAddressSearch: string) {
  _reportEvent({
    category: Category.CURRENCY_SELECT,
    action: types.search,
    label: isAddressSearch,
  })
}

type slippageToleranceType = keyof typeof types.slippageTolerance
function _slippageToleranceAnalytics(option: slippageToleranceType, value: number) {
  _reportEvent({
    category: Category.ORDER_SLIPAGE_TOLERANCE,
    action: types.slippageTolerance[option],
    value,
  })
}

export const slippageToleranceAnalytics = debounce(([option, value]: [slippageToleranceType, number]) => {
  _slippageToleranceAnalytics(option, value)
}, 2000)
