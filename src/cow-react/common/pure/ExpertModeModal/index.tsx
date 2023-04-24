// eslint-disable-next-line no-restricted-imports
import { Trans } from '@lingui/macro'
import Modal from '@cow/common/pure/Modal'
import styled from 'styled-components/macro'
import { X } from 'react-feather'
import { ConfirmedButton } from '../ConfirmedButton'

const ModalContentWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: ${({ theme }) => theme.text2};
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 24px;

  > p {
    line-height: 1.4;
    margin: 0 0 24px;
  }

  > p > strong {
    color: ${({ theme }) => theme.text1};
  }
`

const Header = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 0 0 16px;
  margin: 0 0 24px;
  border-bottom: 1px solid ${({ theme }) => theme.grey1};
  color: ${({ theme }) => theme.text1};

  > b {
    font-size: 21px;
    font-weight: 600;
  }
`

const StyledCloseIcon = styled(X)`
  height: 28px;
  width: 28px;
  opacity: 0.6;
  transition: opacity 0.3s ease-in-out;

  &:hover {
    cursor: pointer;
    opacity: 1;
  }

  > line {
    stroke: ${({ theme }) => theme.text1};
  }
`

const ConfirmExpertMode = styled(ConfirmedButton)`
  margin-bottom: 15px;
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
