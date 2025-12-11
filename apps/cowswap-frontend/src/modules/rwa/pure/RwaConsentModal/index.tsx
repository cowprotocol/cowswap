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
}

export function RwaConsentModal(props: RwaConsentModalProps): ReactNode {
  const { onDismiss, onConfirm, token } = props

  const displaySymbol = token?.symbol || 'this token'

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
              Access to {displaySymbol} through this interface is subject to regulatory and location-based restrictions.
            </Trans>
          </p>
          <p>
            <Trans>
              We could not reliably determine your location (for example due to VPN or privacy settings). Before you can
              proceed with {displaySymbol}, you need to confirm that you are allowed to interact with this token.
            </Trans>
          </p>
          <styledEl.AcknowledgementSection>
            <p>
              <Trans>By clicking Confirm, you acknowledge that:</Trans>
            </p>
            <styledEl.BulletList>
              <li>
                <Trans>
                  You are not accessing this interface from a country or region where this token is restricted or
                  prohibited.
                </Trans>
              </li>
              <li>
                <Trans>
                  You are eligible under your local laws and any applicable terms to view and trade this token.
                </Trans>
              </li>
              <li>
                <Trans>
                  You understand that it is your responsibility to comply with all laws and restrictions that apply to
                  you.
                </Trans>
              </li>
            </styledEl.BulletList>
          </styledEl.AcknowledgementSection>
          <p>
            <Trans>
              If any of the above is not true, you must select Cancel and you will not be able to proceed with this
              asset through this interface.
            </Trans>
          </p>
        </styledEl.Body>
        <styledEl.ButtonContainer>
          <ButtonOutlined onClick={onDismiss}>
            <Trans>Cancel</Trans>
          </ButtonOutlined>
          <ButtonPrimary onClick={onConfirm}>
            <Trans>Confirm and continue</Trans>
          </ButtonPrimary>
        </styledEl.ButtonContainer>
      </styledEl.Contents>
    </styledEl.Wrapper>
  )
}
