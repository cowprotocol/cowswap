import { ReactNode } from 'react'

import { ButtonPrimary, ModalHeader, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import QRCode from 'react-qrcode-logo'
import styled from 'styled-components/macro'

import { CowModal } from 'common/pure/Modal'

import { ConnectState } from '../../hooks/useTelegramConnect'

const QR_SIZE_PX = 200

interface ConnectTelegramModalProps {
  isOpen: boolean
  connectState: ConnectState
  deepLink: string | null
  onRetry(): void
  onDismiss(): void
}

export function ConnectTelegramModal({
  isOpen,
  connectState,
  deepLink,
  onRetry,
  onDismiss,
}: ConnectTelegramModalProps): ReactNode {
  return (
    <CowModal isOpen={isOpen} onDismiss={onDismiss}>
      <ModalContent>
        <ModalHeader onClose={onDismiss}>
          <Trans>Connect Telegram</Trans>
        </ModalHeader>
        <ModalBody>
          {connectState === 'expired' ? (
            <>
              <Message>
                <Trans>This link expired before you tapped Start in Telegram.</Trans>
              </Message>
              <ButtonPrimary onClick={onRetry}>
                <Trans>Get a new link</Trans>
              </ButtonPrimary>
            </>
          ) : connectState === 'error' ? (
            <>
              <Message>
                <Trans>Something went wrong. Please try again.</Trans>
              </Message>
              <ButtonPrimary onClick={onRetry}>
                <Trans>Try again</Trans>
              </ButtonPrimary>
            </>
          ) : deepLink ? (
            <>
              <Message>
                <Trans>
                  Scan this code, or open the link on this device, then tap &ldquo;Start&rdquo; in the chat.
                </Trans>
              </Message>
              <QrFrame>
                <QRCode value={deepLink} size={QR_SIZE_PX} quietZone={2} />
              </QrFrame>
              <ButtonPrimary as="a" href={deepLink} target="_blank" rel="noopener noreferrer">
                <Trans>Open in Telegram</Trans>
              </ButtonPrimary>
              <Status>
                <Trans>Waiting for you to tap Start&hellip;</Trans>
              </Status>
            </>
          ) : (
            <Message>
              <Trans>Preparing your connect link&hellip;</Trans>
            </Message>
          )}
        </ModalBody>
      </ModalContent>
    </CowModal>
  )
}

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 10px 20px 24px;
`

const QrFrame = styled.div`
  border-radius: 16px;
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  padding: 16px;
  background: #fff;
`

const Message = styled.p`
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const Status = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
`
