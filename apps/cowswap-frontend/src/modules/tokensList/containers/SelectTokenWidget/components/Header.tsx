import { ReactNode } from 'react'

import { BackButton } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { SettingsIcon } from 'modules/trade/pure/Settings'

import * as styledEl from '../../../pure/SelectTokenModal/styled'
import { useHeaderState } from '../hooks'

/**
 * SelectTokenWidget.Header - Title bar with back button, title, and manage button.
 * Uses useHeaderState hook that combines config + callbacks.
 */
export function Header(): ReactNode {
  const { title, showManageButton, onDismiss, onOpenManageWidget } = useHeaderState()

  return (
    <styledEl.TitleBar>
      <styledEl.TitleGroup>
        <BackButton onClick={onDismiss} />
        <styledEl.ModalTitle>{title}</styledEl.ModalTitle>
      </styledEl.TitleGroup>
      {showManageButton && (
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
