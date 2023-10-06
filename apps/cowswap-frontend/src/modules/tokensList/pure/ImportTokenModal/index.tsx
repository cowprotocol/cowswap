import { TokenWithLogo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { ButtonPrimary } from '@cowprotocol/ui'

import { AlertCircle } from 'react-feather'

import * as styledEl from './styled'

import { ModalHeader } from '../ModalHeader'
import { TokenLogo } from '../TokenLogo'

export interface ImportTokenModalProps {
  token: TokenWithLogo
  onBack(): void
  onDismiss(): void
  onImport(token: TokenWithLogo): void
}

export function ImportTokenModal(props: ImportTokenModalProps) {
  const { token, onBack, onDismiss, onImport } = props

  return (
    <styledEl.Wrapper>
      <ModalHeader onBack={onBack} onClose={onDismiss}>
        Import token
      </ModalHeader>
      <styledEl.Contents>
        <styledEl.AlertIcon size={48} strokeWidth={1} />
        <p>
          This token doesn't appear on the active token list(s). Make sure this is the token that you want to trade.
        </p>
        <styledEl.TokenInfo>
          <TokenLogo token={token} />
          <styledEl.StyledTokenSymbol token={token} />
          <styledEl.TokenName>{token.name}</styledEl.TokenName>
          <a
            target="_blank"
            href={getExplorerLink(token.chainId, token.address, ExplorerDataType.TOKEN)}
            rel="noreferrer"
          >
            {token.address}
          </a>
          <styledEl.UnknownSourceWarning>
            <AlertCircle size={14} />
            <span>Unknown Source</span>
          </styledEl.UnknownSourceWarning>
        </styledEl.TokenInfo>
        <ButtonPrimary onClick={() => onImport(token)}>Import token</ButtonPrimary>
      </styledEl.Contents>
    </styledEl.Wrapper>
  )
}
