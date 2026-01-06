/**
 * Header Slot - Title bar with back button and manage button (settings icon)
 *
 * Simple props-based component for maximum flexibility.
 */
import { ReactNode } from 'react'

import { BackButton } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { SettingsIcon } from 'modules/trade/pure/Settings'

import * as styledEl from '../../../../pure/SelectTokenModal/styled'

export interface HeaderProps {
  title?: string
  showManageButton?: boolean
  onDismiss: () => void
  onOpenManageWidget?: () => void
}

export function Header({
  title = t`Select token`,
  showManageButton = false,
  onDismiss,
  onOpenManageWidget,
}: HeaderProps): ReactNode {
  return (
    <styledEl.TitleBar>
      <styledEl.TitleGroup>
        <BackButton onClick={onDismiss} />
        <styledEl.ModalTitle>{title}</styledEl.ModalTitle>
      </styledEl.TitleGroup>
      {showManageButton && onOpenManageWidget && (
        <styledEl.TitleActions>
          <styledEl.TitleActionButton
            id="list-token-manage-button"
            onClick={onOpenManageWidget}
            aria-label={t`Manage token lists`}
            title={t`Manage token lists`}
          >
            <SettingsIcon />
          </styledEl.TitleActionButton>
        </styledEl.TitleActions>
      )}
    </styledEl.TitleBar>
  )
}
