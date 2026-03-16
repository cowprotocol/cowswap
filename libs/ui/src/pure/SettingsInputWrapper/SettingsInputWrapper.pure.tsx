import { ReactNode } from 'react'

import * as styledEl from './SettingsInputWrapper.styled'

import { SettingsLabel } from '../SettingsLabel/SettingsLabel.pure'

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
      <SettingsLabel title={label} tooltip={tooltip} />
      <styledEl.Body>{children}</styledEl.Body>
      {footerSlot ? <styledEl.Footer>{footerSlot}</styledEl.Footer> : null}
    </styledEl.WrapperLabel>
  )
}
