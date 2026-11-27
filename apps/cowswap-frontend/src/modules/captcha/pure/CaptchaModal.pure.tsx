import { ReactNode, RefCallback } from 'react'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { CowModal } from 'common/pure/Modal'
import { NewModal } from 'common/pure/NewModal'

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 10px 10px;
`

export interface CaptchaModalProps {
  isOpen: boolean
  isError: boolean
  onDismiss(): void
  turnstileTargetRef: RefCallback<HTMLDivElement>
}

export function CaptchaModal({ isOpen, isError, onDismiss, turnstileTargetRef }: CaptchaModalProps): ReactNode {
  return (
    <CowModal isOpen={isOpen} onDismiss={onDismiss} maxWidth={420}>
      <NewModal title={t`Verify your browser`} modalMode onDismiss={onDismiss}>
        <Body>
          <p>
            {isError ? (
              <Trans>
                Couldn't verify your browser. If you use an ad blocker or firewall, allow challenges.cloudflare.com and
                reload.
              </Trans>
            ) : (
              <Trans>CoW Swap is limiting requests from this browser. Complete the check below to continue.</Trans>
            )}
          </p>
          <div ref={turnstileTargetRef} />
        </Body>
      </NewModal>
    </CowModal>
  )
}
