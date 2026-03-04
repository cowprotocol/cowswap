import { ReactNode } from 'react'

import IMAGE_ICON_SETTINGS_ALT from '@cowprotocol/assets/images/icon-settings-alt.svg'

import SVG from 'react-inlinesvg'

export function SettingsIcon(): ReactNode {
  return <SVG src={IMAGE_ICON_SETTINGS_ALT} />
}
