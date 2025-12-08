import { Command } from '@cowprotocol/types'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { ContentWrapper, Modal } from 'common/pure/Modal'

import { ConfirmationModalHeader } from './ConfirmationModalHeader'

import { ConfirmedButton } from '../ConfirmedButton'

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
export interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  description?: string
  warning?: string
  callToAction?: string
  onDismiss: Command
  onEnable: Command
  confirmWord: string
  action: string
  skipInput?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ConfirmationModal({
  isOpen,
  title,
  description,
  warning,
  callToAction,
  onDismiss,
  onEnable,
  action,
  confirmWord,
  skipInput = false,
}: ConfirmationModalProps) {
  const shouldShowDescription = !!description
  const shouldShowWarning = !!warning

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={100}>
      <ModalContentWrapper>
        <ConfirmationModalHeader onCloseClick={onDismiss}>{title}</ConfirmationModalHeader>
        {shouldShowDescription && <Description>{description}</Description>}
        {shouldShowWarning && (
          <Description>
            <Warning>{warning}</Warning>
          </Description>
        )}
        <ConfirmedButton skipInput={skipInput} action={action} confirmWord={confirmWord} onConfirm={onEnable}>
          {callToAction ? callToAction : <Trans>Confirm</Trans>}
        </ConfirmedButton>
      </ModalContentWrapper>
    </Modal>
  )
}
