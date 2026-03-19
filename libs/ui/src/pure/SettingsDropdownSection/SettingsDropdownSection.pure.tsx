import { ReactElement, ReactNode } from 'react'

import * as styledEl from './SettingsDropdownSection.styled'

export interface SettingsDropdownSectionProps {
  title: string
  children: ReactNode
}

export function SettingsDropdownSection({ title, children }: SettingsDropdownSectionProps): ReactElement {
  return (
    <styledEl.Section>
      <styledEl.Title>{title}</styledEl.Title>

      {children}
    </styledEl.Section>
  )
}
