import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { ButtonPrimary, ExternalLink, ModalHeader, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { AlertCircle, AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'

import * as styledEl from './styled'

const ExternalLinkStyled = styled(ExternalLink)`
  text-decoration: underline;
  color: inherit;
`

const BlockedAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(${UI.COLOR_DANGER_BG});
  color: var(${UI.COLOR_DANGER_TEXT});
  border-radius: 10px;
  font-size: 13px;

  > svg {
    flex-shrink: 0;
  }
`

export interface ImportRestriction {
  isBlocked: boolean
  message: string
}

export interface ImportTokenModalProps {
  tokens: TokenWithLogo[]
  restriction?: ImportRestriction | null

  onBack?(): void

  onDismiss(): void

  onImport(tokens: TokenWithLogo[]): void
}

export function ImportTokenModal(props: ImportTokenModalProps): ReactNode {
  const { tokens, restriction, onBack, onDismiss, onImport } = props

  return (
    <styledEl.Wrapper>
      <ModalHeader onBack={onBack} onClose={onDismiss}>
        <Trans>Import token</Trans>
      </ModalHeader>
      <styledEl.Contents>
        <styledEl.AlertIcon size={48} strokeWidth={1} />
        <p>
          <Trans>
            This token doesn't appear on the active token list(s). Make sure this is the token that you want to trade.
          </Trans>
        </p>
        {tokens.map((token) => (
          <styledEl.TokenInfo key={token.address.toLowerCase()}>
            <TokenLogo token={token} size={24} />
            <styledEl.StyledTokenSymbol token={token} />
            <styledEl.StyledTokenName token={token} />
            <ExternalLinkStyled
              target="_blank"
              href={getExplorerLink(token.chainId, token.address, ExplorerDataType.TOKEN)}
              rel="noreferrer"
            >
              {token.address}
            </ExternalLinkStyled>
            <styledEl.UnknownSourceWarning>
              <AlertCircle size={14} />
              <span>
                <Trans>Unknown Source</Trans>
              </span>
            </styledEl.UnknownSourceWarning>
          </styledEl.TokenInfo>
        ))}
        {restriction?.isBlocked && (
          <BlockedAlert>
            <AlertTriangle size={20} />
            <span>{restriction.message}</span>
          </BlockedAlert>
        )}
        <ButtonPrimary onClick={() => onImport(tokens)} disabled={restriction?.isBlocked}>
          <Trans>Import</Trans>
        </ButtonPrimary>
      </styledEl.Contents>
    </styledEl.Wrapper>
  )
}
