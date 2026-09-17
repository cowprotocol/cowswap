import { ReactNode } from 'react'

import SettingsAltIcon from '@cowprotocol/assets/images/icon-settings-alt.svg?react'

/**
 * Keep this one inline to prevent a flicker and layour shift when the page loads. Do not use react-inlinesvg.
 */
export function SettingsIcon(): ReactNode {
  return <SettingsAltIcon />
}
