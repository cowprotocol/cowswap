/**
 * Header Slot - Title bar with back button and optional actions
 */
import { ReactNode } from 'react'

import { BackButton } from '@cowprotocol/ui'

import * as styledEl from '../../../../pure/SelectTokenModal/styled'
import { useOnDismiss } from '../store'

export interface HeaderProps {
  title?: string
  actions?: ReactNode
}

export function Header({ title = 'Select token', actions }: HeaderProps): ReactNode {
  const onDismiss = useOnDismiss()

  return (
    <styledEl.TitleBar>
      <styledEl.TitleGroup>
        <BackButton onClick={onDismiss} />
        <styledEl.ModalTitle>{title}</styledEl.ModalTitle>
      </styledEl.TitleGroup>
      {actions && <styledEl.TitleActions>{actions}</styledEl.TitleActions>}
    </styledEl.TitleBar>
  )
}
