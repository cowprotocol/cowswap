import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { ButtonPrimary, ButtonOutlined, ModalHeader } from '@cowprotocol/ui'

import * as styledEl from './styled'

export interface RwaConsentModalProps {
  onDismiss(): void
  onConfirm(): void
  token?: TokenWithLogo
  consentHash?: string
}

export function RwaConsentModal(props: RwaConsentModalProps): ReactNode {
  const { onDismiss, onConfirm, token } = props

  const displaySymbol = token?.symbol || 'this token'

  return (
    <styledEl.Wrapper>
      <ModalHeader onClose={onDismiss}>Additional confirmation required for this token</ModalHeader>
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
            We could not reliably determine your location (e.g., due to VPN or privacy settings). Access to{' '}
            {displaySymbol} is strictly limited to specific regions.
          </p>
          <styledEl.AcknowledgementSection>
            <p>By clicking Confirm, you expressly represent and warrant that you are NOT:</p>
            <styledEl.BulletList>
              <li>A U.S. Person or resident of the United States.</li>
              <li>A resident of the EU or EEA.</li>
              <li>A resident of any country subject to international sanctions (e.g., OFAC, UN lists).</li>
              <li>
                A resident of any jurisdiction where trading securities or cryptographic tokens is regulated or
                prohibited by applicable laws.
              </li>
            </styledEl.BulletList>
          </styledEl.AcknowledgementSection>
          <p>If you fall into any of these categories, select Cancel.</p>
          <p>You are solely responsible for complying with your local laws.</p>
        </styledEl.Body>
        <styledEl.ButtonContainer>
          <ButtonPrimary onClick={onConfirm}>I Confirm</ButtonPrimary>
          <ButtonOutlined onClick={onDismiss}>Cancel</ButtonOutlined>
        </styledEl.ButtonContainer>
      </styledEl.Contents>
    </styledEl.Wrapper>
  )
}
