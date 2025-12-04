import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { ButtonPrimary, ButtonOutlined } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { ConfirmationModalHeader } from 'common/pure/ConfirmationModal/ConfirmationModalHeader'
import { ContentWrapper, Modal } from 'common/pure/Modal'

const ModalContentWrapper = styled(ContentWrapper)`
  flex: 1;
  padding: 1.5rem;
  color: inherit;
  border-radius: 1.5rem;
`

const Description = styled.p`
  line-height: 1.4;
  margin: 0 0 1.5rem;
`

const Warning = styled.strong`
  color: inherit;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`

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

