import { AutoColumn } from '@src/components/Column'
import { RowBetween } from '@src/components/Row'
import { Text } from 'rebass'
// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { ButtonError } from 'components/Button'
import Modal from '@src/components/Modal'
import styled from 'styled-components/macro'
import { X } from 'react-feather'

const StyledCloseIcon = styled(X)`
  height: 20px;
  width: 20px;
  :hover {
    cursor: pointer;
  }

  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`

const Break = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.bg3};
`

const ModalContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 20px;
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
        <AutoColumn gap="lg">
          <RowBetween style={{ padding: '0 2rem' }}>
            <div />
            <Text fontWeight={500} fontSize={20}>
              <Trans>Are you sure?</Trans>
            </Text>
            <StyledCloseIcon onClick={onDismiss} />
          </RowBetween>
          <Break />
          <AutoColumn gap="lg" style={{ padding: '0 2rem' }}>
            <Text fontWeight={500} fontSize={20}>
              <Trans>
                Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result
                in bad rates and lost funds.
              </Trans>
            </Text>
            <Text fontWeight={600} fontSize={20}>
              <Trans>ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.</Trans>
            </Text>
            <ButtonError
              error={true}
              padding={'12px'}
              onClick={() => {
                const confirmWord = t`confirm`
                if (window.prompt(t`Please type the word "${confirmWord}" to enable expert mode.`) === confirmWord) {
                  onEnable()
                }
              }}
            >
              <Text fontSize={20} fontWeight={500} id="confirm-expert-mode">
                <Trans>Turn On Expert Mode</Trans>
              </Text>
            </ButtonError>
          </AutoColumn>
        </AutoColumn>
      </ModalContentWrapper>
    </Modal>
  )
}
