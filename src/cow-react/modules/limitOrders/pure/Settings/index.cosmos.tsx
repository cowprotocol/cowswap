import { Settings, SettingsProps } from './index'

const defaultProps: SettingsProps = {
  state: { expertMode: true, showRecipient: false, deadlineMilliseconds: 200_000, customDeadlineTimestamp: null },
  onStateChanged(state) {
    console.log('Settings state changed: ', state)
  },
}

export default <Settings {...defaultProps} />
