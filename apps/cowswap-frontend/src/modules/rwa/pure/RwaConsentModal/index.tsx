import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { ButtonPrimary, ButtonOutlined, ModalHeader } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './styled'

export interface RwaConsentModalProps {
  onDismiss(): void
  onConfirm(): void
  token?: TokenWithLogo
  tosHash: string
}

const IPFS_GATEWAY = 'https://ipfs.io/ipfs'

export function RwaConsentModal(props: RwaConsentModalProps): ReactNode {
  const { onDismiss, onConfirm, token, tosHash } = props

  const displaySymbol = token?.symbol || 'this token'
  const consentUrl = `${IPFS_GATEWAY}/${tosHash}`

  return (
    <styledEl.Wrapper>
      <ModalHeader onClose={onDismiss}>
        <Trans>Additional confirmation required for this token</Trans>
      </ModalHeader>
      <styledEl.Contents>
        {token && (
          <styledEl.TokenBlock>
            <TokenLogo token={token} size={48} />
            <styledEl.TokenSymbolName>
              <styledEl.TokenSymbol>{token.symbol}</styledEl.TokenSymbol>
              {token.name && (
                <>
                  <styledEl.TokenNameDivider>—</styledEl.TokenNameDivider>
                  <styledEl.TokenName>{token.name}</styledEl.TokenName>
                </>
              )}
            </styledEl.TokenSymbolName>
          </styledEl.TokenBlock>
        )}
        <styledEl.Body>
          <p>
            <Trans>
              We could not reliably determine your location (e.g., due to VPN or privacy settings). Access to{' '}
              {displaySymbol} is strictly limited to specific regions.
            </Trans>
          </p>
          <styledEl.AcknowledgementSection>
            <p>
              <Trans>By clicking Confirm, you expressly represent and warrant that you are NOT:</Trans>
            </p>
            <styledEl.BulletList>
              <li>
                <Trans>A U.S. Person or resident of the United States.</Trans>
              </li>
              <li>
                <Trans>A resident of the EU or EEA.</Trans>
              </li>
              <li>
                <Trans>A resident of any country subject to international sanctions (e.g., OFAC, UN lists).</Trans>
              </li>
              <li>
                <Trans>
                  A resident of any jurisdiction where trading securities or cryptographic tokens is regulated or
                  prohibited by applicable laws.
                </Trans>
              </li>
            </styledEl.BulletList>
          </styledEl.AcknowledgementSection>
          <p>
            <Trans>If you fall into any of these categories, select Cancel.</Trans>
          </p>
          <p>
            <Trans>You are solely responsible for complying with your local laws.</Trans>
          </p>
          <styledEl.ConsentLink href={consentUrl} target="_blank" rel="noopener noreferrer">
            <Trans>View full consent terms ↗</Trans>
          </styledEl.ConsentLink>
        </styledEl.Body>
        <styledEl.ButtonContainer>
          <ButtonPrimary onClick={onConfirm}>
            <Trans>I Confirm</Trans>
          </ButtonPrimary>
          <ButtonOutlined onClick={onDismiss}>
            <Trans>Cancel</Trans>
          </ButtonOutlined>
        </styledEl.ButtonContainer>
      </styledEl.Contents>
    </styledEl.Wrapper>
  )
}
