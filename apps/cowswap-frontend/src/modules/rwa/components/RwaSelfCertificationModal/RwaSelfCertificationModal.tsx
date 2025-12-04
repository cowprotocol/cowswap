import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { ButtonPrimary, ButtonOutlined } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { ConfirmationModalHeader } from 'common/pure/ConfirmationModal/ConfirmationModalHeader'
import { Modal } from 'common/pure/Modal'

import { ButtonContainer, Description, ModalContentWrapper, Warning } from './styled'

export interface RwaSelfCertificationModalProps {
  isOpen: boolean
  title: string
  description: string
  warning?: string
  issuerName?: string
  tosVersion?: string
  onDismiss: Command
  onConfirm: Command
}

export function RwaSelfCertificationModal({
  isOpen,
  title,
  description,
  warning,
  issuerName,
  tosVersion,
  onDismiss,
  onConfirm,
}: RwaSelfCertificationModalProps): ReactNode {
  const shouldShowWarning = !!warning

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={100}>
      <ModalContentWrapper>
        <ConfirmationModalHeader onCloseClick={onDismiss}>
          <Trans>{title}</Trans>
        </ConfirmationModalHeader>
        <Description>
          <Trans>{description}</Trans>
        </Description>
        {shouldShowWarning && (
          <Description>
            <Warning>
              <Trans>{warning}</Trans>
            </Warning>
          </Description>
        )}
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

