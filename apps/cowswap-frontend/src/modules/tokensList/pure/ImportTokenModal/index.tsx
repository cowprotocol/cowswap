import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { getTokenId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { ButtonPrimary, ExternalLink, UI, Modal } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'

import { useTokenRiskImport } from 'common/containers/TokenRisk'
import { TokenRiskAcknowledgement } from 'common/pure/TokenRisk'

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

  const risk = useTokenRiskImport(tokens)

  const handleImport = (): void => {
    risk.confirm()
    onImport(tokens)
  }

  return (
    <styledEl.Wrapper>
      <Modal.Header onBack={onBack} onClose={onDismiss}>
        <Trans>Import token</Trans>
      </Modal.Header>
      <styledEl.Contents>
        <styledEl.AlertIcon size={48} strokeWidth={1} />
        <p>
          <Trans>
            This token doesn't appear on the active token list(s). Make sure this is the token that you want to trade.
          </Trans>
        </p>
        {tokens.map((token) => (
          <styledEl.TokenInfo key={getTokenId(token)}>
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
              <AlertTriangle size={14} />
              <span>
                <Trans>Unknown Source</Trans>
              </span>
            </styledEl.UnknownSourceWarning>
          </styledEl.TokenInfo>
        ))}
        {risk.items.map((item) =>
          item.warnings.length ? (
            <styledEl.RiskPanel
              key={item.id}
              warnings={item.warnings}
              symbol={item.symbol}
              address={item.token.address}
              updatedAt={item.updatedAt}
            />
          ) : null,
        )}
        {restriction?.isBlocked && (
          <BlockedAlert>
            <AlertTriangle size={20} />
            <span>{restriction.message}</span>
          </BlockedAlert>
        )}
      </styledEl.Contents>
      <styledEl.StickyFooter>
        {risk.items.map((item) => (
          <TokenRiskAcknowledgement
            key={item.id}
            seriousCodes={item.seriousCodes}
            symbol={item.symbol}
            isChecked={item.isAcknowledged}
            onChange={(isChecked) => risk.acknowledge(item.id, isChecked)}
          />
        ))}
        <ButtonPrimary onClick={handleImport} disabled={restriction?.isBlocked || risk.isBlocking}>
          <Trans>Import</Trans>
        </ButtonPrimary>
      </styledEl.StickyFooter>
    </styledEl.Wrapper>
  )
}
