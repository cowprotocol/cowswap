import { ReactNode, useState } from 'react'

import { getTokenListViewLink, ListState, TokenLogo } from '@cowprotocol/tokens'
import { ButtonPrimary, ModalHeader } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { AlertCircle } from 'react-feather'

import * as styledEl from './styled'

export interface ImportListModalProps {
  list: ListState
  isBlocked?: boolean
  blockReason?: string

  onImport(list: ListState): void

  onBack(): void

  onDismiss(): void
}

export function ImportListModal(props: ImportListModalProps): ReactNode {
  const { list, onBack, onDismiss, onImport, isBlocked, blockReason } = props
  const defaultBlockReason = t`This token list is not available in your region.`

  const [isAccepted, setIsAccepted] = useState(false)

  const viewLink = getTokenListViewLink(list.source)

  return (
    <styledEl.Wrapper>
      <ModalHeader onBack={onBack} onClose={onDismiss}>
        <Trans>Import List</Trans>
      </ModalHeader>
      <styledEl.ListInfo>
        <TokenLogo logoURI={list.list.logoURI} size={36} />
        <div>
          <styledEl.ListTitle>
            {list.list.name} · {list.list.tokens.length} tokens
          </styledEl.ListTitle>
          <styledEl.ListLink target="_blank" href={viewLink} rel="noreferrer">
            {list.source}
          </styledEl.ListLink>
        </div>
      </styledEl.ListInfo>
      {isBlocked ? (
        <styledEl.BlockedWarning>
          <AlertCircle size={18} />
          {blockReason || defaultBlockReason}
        </styledEl.BlockedWarning>
      ) : (
        <>
          <styledEl.ExternalSourceAlertStyled
            title={t`Import at your own risk`}
            onChange={() => setIsAccepted((state) => !state)}
          >
            <Trans>
              <p>
                By adding this list you are implicitly trusting that the data is correct. Anyone can create a list,
                including creating fake versions of existing lists and lists that claim to represent projects that do
                not have one.
              </p>
              <p>
                <strong>If you purchase a token from this list, you may not be able to sell it back.</strong>
              </p>
            </Trans>
          </styledEl.ExternalSourceAlertStyled>
          <styledEl.ActionButtonWrapper>
            <ButtonPrimary disabled={!isAccepted} onClick={() => onImport(list)}>
              <Trans>Import</Trans>
            </ButtonPrimary>
          </styledEl.ActionButtonWrapper>
        </>
      )}
    </styledEl.Wrapper>
  )
}
