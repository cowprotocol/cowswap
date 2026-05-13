import { SettingsInputWrapper } from './SettingsInputWrapper.pure'

import { Slot } from '../../cosmosShared'

const SettingsInputWrapperFixtures = {
  'SettingsInputWrapper with label and input': (
    <SettingsInputWrapper id="cosmos-wrapper-1" label="Field label" tooltip="Help text for this field.">
      <input type="text" placeholder="Enter value" style={{ padding: '8px', width: '100%' }} />
    </SettingsInputWrapper>
  ),
  'SettingsInputWrapper with Slot children and footerSlot': (
    <SettingsInputWrapper
      id="cosmos-wrapper-2"
      label="With slots"
      tooltip="This field has Slot placeholders."
      footerSlot={<Slot propName="footerSlot" variant="block" />}
    >
      <Slot propName="children" variant="block" />
    </SettingsInputWrapper>
  ),
}

export default SettingsInputWrapperFixtures
