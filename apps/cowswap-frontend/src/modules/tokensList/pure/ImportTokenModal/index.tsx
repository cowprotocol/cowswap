import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { ButtonPrimary } from '@cowprotocol/ui'

import { AlertCircle } from 'react-feather'

import * as styledEl from './styled'

import { TokenWithLogo } from '../../types'
import { ModalHeader } from '../ModalHeader'
import { TokenLogo } from '../TokenLogo'

export interface ImportTokenModalProps {
  token: TokenWithLogo
  onBack(): void
  onClose(): void
}

export function ImportTokenModal(props: ImportTokenModalProps) {
  const { token, onBack, onClose } = props

  return (
    <styledEl.Wrapper>
      <ModalHeader onBack={onBack} onClose={onClose}>
        Import token
      </ModalHeader>
      <styledEl.Contents>
        <styledEl.AlertIcon size={48} strokeWidth={1} />
        <p>
          This token doesn't appear on the active token list(s). Make sure this is the token that you want to trade.
        </p>
        <styledEl.TokenInfo>
          <TokenLogo logoURI={token.logoURI} />
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
        <ButtonPrimary>Import token</ButtonPrimary>
      </styledEl.Contents>
    </styledEl.Wrapper>
  )
}
