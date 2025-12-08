import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { ButtonPrimary, ButtonOutlined } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { ConfirmationModalHeader } from 'common/pure/ConfirmationModal/ConfirmationModalHeader'
import { Modal } from 'common/pure/Modal'

import { ButtonContainer, Description, ModalContentWrapper, Warning } from './styled'

export interface RwaSelfCertificationModalProps {
  isOpen: boolean
  issuerName?: string
  tosVersion?: string
  onDismiss: Command
  onConfirm: Command
}

export function RwaSelfCertificationModal({
  isOpen,
  issuerName,
  tosVersion,
  onDismiss,
  onConfirm,
}: RwaSelfCertificationModalProps): ReactNode {
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={100}>
      <ModalContentWrapper>
        <ConfirmationModalHeader onCloseClick={onDismiss}>
          <Trans>RWA Token Self-Certification Required</Trans>
        </ConfirmationModalHeader>
        <Description>
          <Trans>Your IP address could not be determined (VPN, privacy settings, etc.). To trade RWA-restricted tokens, you must confirm that you are not a US person, EU resident, or resident in a sanctioned country.</Trans>
        </Description>
        <Description>
          <Warning>
            <Trans>By confirming, you acknowledge that you meet the eligibility requirements for trading RWA tokens.</Trans>
          </Warning>
        </Description>
        {issuerName && (
          <Description>
            <Trans>Issuer: {issuerName}</Trans>
          </Description>
        )}
        {tosVersion && (
          <Description>
            <Trans>Terms of Service Version: {tosVersion}</Trans>
          </Description>
        )}
        <ButtonContainer>
          <ButtonOutlined onClick={onDismiss}>
            <Trans>Cancel</Trans>
          </ButtonOutlined>
          <ButtonPrimary onClick={onConfirm}>
            <Trans>Confirm</Trans>
          </ButtonPrimary>
        </ButtonContainer>
      </ModalContentWrapper>
    </Modal>
  )
}

