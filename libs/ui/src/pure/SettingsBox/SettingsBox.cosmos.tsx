import { useState } from 'react'

import { SettingsBox } from './SettingsBox.pure'

function InteractiveSettingsBox(): React.ReactElement {
  const [checked, setChecked] = useState(false)
  return (
    <SettingsBox
      title="Custom Recipient"
      tooltip="Allows you to choose a destination address for the swap other than the connected one."
      checked={checked}
      toggle={() => setChecked((c) => !c)}
    />
  )
}

const SettingsBoxFixtures = {
  SettingsBox: () => <InteractiveSettingsBox />,
  'SettingsBox disabled': (
    <SettingsBox
      title="Lock Limit Price"
      tooltip="When enabled, the limit price stays fixed when changing the BUY amount."
      checked={true}
      toggle={() => {}}
      disabled
    />
  ),
}

export default SettingsBoxFixtures
