import { SettingsDropdownSection } from './SettingsDropdownSection.pure'

import { Slot } from '../../cosmosShared'

const SettingsDropdownSectionFixtures = {
  SettingsDropdownSection: (
    <SettingsDropdownSection title="Interface">
      <Slot propName="children" variant="block" />
    </SettingsDropdownSection>
  ),
}

export default SettingsDropdownSectionFixtures
