import { Settings, SettingsProps } from './index'

const defaultProps: SettingsProps = {
  state: {
    showRecipient: false,
    partialFillsEnabled: true,
    deadlineMilliseconds: 200_000,
    customDeadlineTimestamp: null,
    limitPricePosition: 'between',
    limitPriceLocked: false,
    ordersTableOnLeft: false,
    isUsdValuesMode: false,
  },
  onStateChanged(state) {
    console.log('Settings state changed: ', state)
  },
}

export default <Settings {...defaultProps} />
