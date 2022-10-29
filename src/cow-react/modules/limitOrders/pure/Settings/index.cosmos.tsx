import { Settings, SettingsProps } from './index'

const defaultProps: SettingsProps = {
  state: { expertMode: true, showRecipient: false },
  onStateChanged(state) {
    console.log('Settings state changed: ', state)
  },
}

export default <Settings {...defaultProps} />
