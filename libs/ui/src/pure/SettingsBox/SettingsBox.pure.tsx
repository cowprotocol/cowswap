import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import * as styledEl from './SettingsBox.styled'

import { SettingsLabel } from '../SettingsLabel/SettingsLabel.pure'
import { Toggle } from '../Toggle/Toggle.pure'

interface SettingsBoxProps {
  id?: string
  title: string
  tooltip: ReactNode
  checked: boolean
  disabled?: boolean
  toggle: Command
}

export function SettingsBox({ id, title, tooltip, checked, toggle, disabled = false }: SettingsBoxProps): ReactNode {
  return (
    <styledEl.SettingsBoxWrapper>
      <SettingsLabel title={title} tooltip={tooltip} />
      <Toggle root="span" id={id} checked={checked} toggle={toggle} disabled={disabled} />
    </styledEl.SettingsBoxWrapper>
  )
}
