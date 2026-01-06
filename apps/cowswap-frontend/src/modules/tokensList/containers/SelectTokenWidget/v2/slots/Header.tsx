/**
 * Header Slot - Title bar with back button and manage button
 */
import { ReactNode } from 'react'

import { BackButton, ButtonSecondary } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import * as styledEl from '../../../../pure/SelectTokenModal/styled'
import { useHeaderState } from '../store'

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
          <ButtonSecondary minHeight={36} onClick={onOpenManageWidget}>
            <Trans>Manage</Trans>
          </ButtonSecondary>
        </styledEl.TitleActions>
      )}
    </styledEl.TitleBar>
  )
}
