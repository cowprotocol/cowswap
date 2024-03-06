import { Settings, SettingsProps } from './index'

const defaultProps: SettingsProps = {
  state: {
    showRecipient: false,
    partialFillsEnabled: true,
    deadlineMilliseconds: 200_000,
    customDeadlineTimestamp: null,
  },
  onStateChanged(state) {
    console.log('Settings state changed: ', state)
  },
}

export default <Settings {...defaultProps} />
