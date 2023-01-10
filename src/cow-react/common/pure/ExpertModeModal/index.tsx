// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { ButtonError } from 'components/Button'
import Modal from 'components/Modal'
import styled from 'styled-components/macro'
import { X } from 'react-feather'

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

        <ButtonError
          id="confirm-expert-mode"
          error={true}
          padding={'12px'}
          onClick={() => {
            const confirmWord = t`confirm`
            if (window.prompt(t`Please type the word "${confirmWord}" to enable expert mode.`) === confirmWord) {
              onEnable()
            }
          }}
        >
          <Trans>Turn On Expert Mode</Trans>
        </ButtonError>
      </ModalContentWrapper>
    </Modal>
  )
}
