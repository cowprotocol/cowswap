import { ReactNode } from 'react'

import * as styledEl from './SettingsLabel.styled'

const NBSP = '\u00A0'

export interface SettingsLabelProps {
  title: string
  tooltip: ReactNode
}

export function SettingsLabel({ title, tooltip }: SettingsLabelProps): ReactNode {
  return (
    <styledEl.SettingsLabelTitle>
      {title}
      {NBSP}
      <styledEl.SettingsLabelHelpTooltip text={tooltip} noMargin dimmed />
    </styledEl.SettingsLabelTitle>
  )
}
