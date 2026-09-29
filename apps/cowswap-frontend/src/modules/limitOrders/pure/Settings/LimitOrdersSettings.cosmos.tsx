import { LimitOrdersSettingsDropdown, SettingsProps } from './LimitOrdersSettings.pure'

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
    enablePartialApprovalBySettings: true,
  },
  onStateChanged(state) {
    console.log('Settings state changed: ', state)
  },
}

export default <LimitOrdersSettingsDropdown {...defaultProps} />
