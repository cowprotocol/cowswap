import { PropsWithChildren, ReactNode } from 'react'

import * as styledEl from './SettingsBoxGroup.styled'

export function SettingsBoxGroup({ children }: PropsWithChildren): ReactNode {
  return <styledEl.SettingsBoxGroupWrapper>{children}</styledEl.SettingsBoxGroupWrapper>
}
