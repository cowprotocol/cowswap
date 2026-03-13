import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import * as styledEl from './SettingsBox.styled'

import { HelpTooltip } from '../HelpTooltip'
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
      <styledEl.SettingsBoxTitle>
        {title}
        <HelpTooltip text={<>{tooltip}</>} />
      </styledEl.SettingsBoxTitle>
      <Toggle root="span" id={id} checked={checked} toggle={toggle} disabled={disabled} />
    </styledEl.SettingsBoxWrapper>
  )
}
