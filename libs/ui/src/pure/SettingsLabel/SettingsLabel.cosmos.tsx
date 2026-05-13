import { SettingsLabel } from './SettingsLabel.pure'

const SettingsLabelFixtures = {
  'SettingsLabel short': <SettingsLabel title="Slippage" tooltip="Maximum price movement you accept." />,
  'SettingsLabel long title': (
    <SettingsLabel
      title="Enable partial executions"
      tooltip="Choose whether orders are partially fillable or fill-or-kill."
    />
  ),
}

export default SettingsLabelFixtures
