import { ReactNode } from 'react'

import * as styledEl from './SettingsInputWrapper.styled'

import { HelpTooltip } from '../HelpTooltip'

export interface SettingsInputWrapperProps {
  id: string
  label: string
  tooltip?: ReactNode
  children: ReactNode
  footerSlot?: ReactNode
}

export function SettingsInputWrapper({
  id,
  label,
  tooltip,
  children,
  footerSlot,
}: SettingsInputWrapperProps): ReactNode {
  return (
    <styledEl.WrapperLabel htmlFor={id}>
      <styledEl.Header>
        <styledEl.LabelText>{label}</styledEl.LabelText>
        {tooltip && <HelpTooltip text={tooltip} />}
      </styledEl.Header>
      <styledEl.Body>{children}</styledEl.Body>
      {footerSlot ? <styledEl.Footer>{footerSlot}</styledEl.Footer> : null}
    </styledEl.WrapperLabel>
  )
}
