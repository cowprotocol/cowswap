import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { Modal } from 'common/pure/Modal'

import { ConfirmationModalHeader } from './ConfirmationModalHeader'

import { ConfirmedButton } from '../ConfirmedButton'

const ModalContentWrapper = styled.div`
  flex: 1;
  padding: 1.5rem;
  color: inherit;
  border-radius: 1.5rem;
  background-color: var(${UI.COLOR_PAPER});
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
  description?: ReactNode
  warning?: string
  callToAction?: string
  onDismiss: Command
  onEnable: Command
  confirmWord: string
  action: string
  bottomContent?: ReactNode
  skipInput?: boolean
}

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
  bottomContent,
  skipInput = false,
}: ConfirmationModalProps): ReactNode {
  const shouldShowDescription = !!description
  const shouldShowWarning = !!warning

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onDismiss()
        }
      }}
    >
      <ModalContentWrapper>
        <ConfirmationModalHeader onCloseClick={onDismiss}>{title}</ConfirmationModalHeader>
        {shouldShowDescription && <Description>{description}</Description>}
        {shouldShowWarning && (
          <Description>
            <Warning>{warning}</Warning>
          </Description>
        )}
        <ConfirmedButton
          skipInput={skipInput}
          action={action}
          confirmWord={confirmWord}
          onConfirm={onEnable}
          bottomContent={bottomContent}
        >
          {callToAction ? callToAction : <Trans>Confirm</Trans>}
        </ConfirmedButton>
      </ModalContentWrapper>
    </Modal>
  )
}
