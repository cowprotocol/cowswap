import { ReactNode } from 'react'

import { ButtonPrimary, ButtonOutlined, ModalHeader } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import * as styledEl from './styled'

export interface RwaConsentModalProps {
  onDismiss(): void
  onConfirm(): void
}

// TODO: Add proper return type annotation
 
export function RwaConsentModal(props: RwaConsentModalProps): ReactNode {
  const { onDismiss, onConfirm } = props

  return (
    <styledEl.Wrapper>
      <ModalHeader onClose={onDismiss}>
        <Trans>Additional verification required</Trans>
      </ModalHeader>
      <styledEl.Contents>
        <styledEl.Body>
          <p>
            <Trans>
              Access to certain tokens on this interface is subject to regulatory and location-based restrictions.
            </Trans>
          </p>
          <p>
            <Trans>
              We could not reliably determine your location (for example due to VPN or privacy settings). Before you can
              interact with these tokens, you must confirm that you are allowed to do so under the laws that apply to
              you.
            </Trans>
          </p>
          <styledEl.AcknowledgementSection>
            <p>
              <Trans>By clicking Confirm, you acknowledge that:</Trans>
            </p>
            <styledEl.BulletList>
              <li>
                <Trans>
                  You are not accessing this interface from a country or region where these tokens are restricted or
                  prohibited.
                </Trans>
              </li>
              <li>
                <Trans>
                  You are eligible under your local laws and any applicable terms to view and trade these tokens.
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

