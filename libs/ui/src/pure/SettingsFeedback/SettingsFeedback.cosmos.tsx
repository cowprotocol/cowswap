import { SettingsFeedback } from './SettingsFeedback.pure'

const SettingsFeedbackFixtures = {
  'SettingsFeedback error': <SettingsFeedback variant="error" message="Enter value within the allowed range." />,
  'SettingsFeedback warning': (
    <SettingsFeedback variant="warning" message="With low slippage, your transaction may expire." />
  ),
  'SettingsFeedback success': <SettingsFeedback variant="success" message="Settings saved successfully." />,
  'SettingsFeedback info': (
    <SettingsFeedback
      variant="info"
      message="Minimum 2 min, maximum 180 min."
      tooltip="Allowed deadline range for EOA wallets."
    />
  ),
}

export default SettingsFeedbackFixtures
