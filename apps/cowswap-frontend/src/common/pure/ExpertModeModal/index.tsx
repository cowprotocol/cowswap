import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { X } from 'react-feather'
import styled from 'styled-components/macro'

import { Modal } from 'common/pure/Modal'

import { ConfirmedButton } from '../ConfirmedButton'

const ModalContentWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: inherit;
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});

  > p {
    line-height: 1.4;
    margin: 0 0 24px;
    color: inherit;
  }

  > p > strong {
    color: inherit;
  }
`

const Header = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 0 0 16px;
  margin: 0 0 24px;
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
  color: inherit;

  > b {
    font-size: 21px;
    font-weight: 600;
  }
`

const StyledCloseIcon = styled(X)`
  height: 28px;
  width: 28px;
  color: inherit;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    cursor: pointer;
    opacity: 1;
  }

  > line {
    stroke: currentColor;
  }
`

const ConfirmExpertMode = styled(ConfirmedButton)`
  margin: 0 0 15px;
`

export interface ExpertModeModalProps {
  isOpen: boolean
  onDismiss(): void
  onEnable(): void
}

export function ExpertModeModal(props: ExpertModeModalProps) {
  const { isOpen, onDismiss, onEnable } = props

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={100}>
      <ModalContentWrapper>
        <Header>
          <b>
            <Trans>Turn on Expert mode?</Trans>
          </b>
          <StyledCloseIcon onClick={onDismiss} />
        </Header>

        <p>
          <Trans>
            Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result in
            bad rates and lost funds.
          </Trans>
        </p>

        <p>
          <strong>
            <Trans>ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING!</Trans>
          </strong>
        </p>

        <ConfirmExpertMode onConfirm={onEnable} action="turn on expert mode" confirmWord="confirm">
          <Trans>Turn On Expert Mode</Trans>
        </ConfirmExpertMode>
      </ModalContentWrapper>
    </Modal>
  )
}
