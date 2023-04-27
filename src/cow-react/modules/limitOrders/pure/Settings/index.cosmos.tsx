import { Settings, SettingsProps } from './index'

const defaultProps: SettingsProps = {
  state: {
    expertMode: true,
    showRecipient: false,
    partialFillsEnabled: true,
    deadlineMilliseconds: 200_000,
    customDeadlineTimestamp: null,
  },
  featurePartialFillsEnabled: true,
  onStateChanged(state) {
    console.log('Settings state changed: ', state)
  },
}

export default <Settings {...defaultProps} />
