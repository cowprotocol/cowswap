import { SettingsInput } from './SettingsInput.pure'

import { Slot } from '../../cosmosShared'

const SettingsInputFixtures = {
  'SettingsInput default': (
    <SettingsInput
      id="cosmos-input-1"
      label="Swap deadline"
      tooltip="Your swap expires after the selected duration."
      placeholder="20"
      value=""
      unit="minutes"
    />
  ),
  'SettingsInput with value': (
    <SettingsInput id="cosmos-input-2" label="Slippage tolerance" placeholder="0.50" value="1.00" unit="%" />
  ),
  'SettingsInput with error': <SettingsInput id="cosmos-input-3" label="Custom amount" value="999" unit="%" error />,
  'SettingsInput disabled': <SettingsInput id="cosmos-input-4" label="Disabled field" value="10" unit="min" disabled />,
  'SettingsInput with footerSlot': (
    <SettingsInput
      id="cosmos-input-5"
      label="With footer slot"
      value=""
      footerSlot={<Slot propName="footerSlot" variant="block" />}
    />
  ),
}

export default SettingsInputFixtures
