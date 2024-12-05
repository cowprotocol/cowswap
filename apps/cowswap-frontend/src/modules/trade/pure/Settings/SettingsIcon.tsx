import IMAGE_ICON_SETTINGS_ALT from '@cowprotocol/assets/images/icon-settings-alt.svg'

import SVG from 'react-inlinesvg'

import { SettingsButtonIcon } from './styled'

export function SettingsIcon({ active }: { active?: boolean }) {
  return (
    <SettingsButtonIcon active={active}>
      <SVG src={IMAGE_ICON_SETTINGS_ALT} />
    </SettingsButtonIcon>
  )
}
