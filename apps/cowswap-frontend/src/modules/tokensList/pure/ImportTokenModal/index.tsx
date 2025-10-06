import { TokenWithLogo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { ButtonPrimary, ExternalLink, ModalHeader } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { AlertCircle } from 'react-feather'
import styled from 'styled-components/macro'

import * as styledEl from './styled'

const ExternalLinkStyled = styled(ExternalLink)`
  text-decoration: underline;
  color: inherit;
`

export interface ImportTokenModalProps {
  tokens: TokenWithLogo[]

  onBack?(): void

  onDismiss(): void

  onImport(tokens: TokenWithLogo[]): void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ImportTokenModal(props: ImportTokenModalProps) {
  const { tokens, onBack, onDismiss, onImport } = props

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
        <ButtonPrimary onClick={() => onImport(tokens)}>
          <Trans>Import</Trans>
        </ButtonPrimary>
      </styledEl.Contents>
    </styledEl.Wrapper>
  )
}
