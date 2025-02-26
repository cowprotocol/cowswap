import IMAGE_ICON_SETTINGS_ALT from '@cowprotocol/assets/images/icon-settings-alt.svg'

import SVG from 'react-inlinesvg'

import { SettingsButtonIcon } from './styled'

export function SettingsIcon() {
  return (
    <SettingsButtonIcon>
      <SVG src={IMAGE_ICON_SETTINGS_ALT} />
    </SettingsButtonIcon>
  )
}
