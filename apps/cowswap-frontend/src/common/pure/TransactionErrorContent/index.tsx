import { BackButton, ButtonPrimary } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'

import { CloseIcon } from 'legacy/theme'

const Wrapper = styled.div`
  width: 100%;
  padding: 15px;
  background: var(${UI.COLOR_PAPER});
  border-radius: 20px;
`

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  font-size: 20px;
`

const Body = styled.div`
  width: 100%;
  text-align: center;
  margin: 80px 0;
`

const Text = styled.div`
  color: var(${UI.COLOR_DANGER});
  font-weight: 500;
  font-size: 16px;
  word-break: break-word;
`

const AlertIcon = styled(AlertTriangle)`
  color: var(${UI.COLOR_DANGER});
  stroke-width: 1.5;
  margin-bottom: 15px;
`

const BackButtonStyled = styled(BackButton)`
  margin-right: -22px;
`

export interface TransactionErrorContentProps {
  message: JSX.Element | string
  onDismiss(): void
  modalMode?: boolean
}

export function TransactionErrorContent(props: TransactionErrorContentProps) {
  const { message, onDismiss, modalMode } = props

  return (
    <Wrapper>
      <Header>
        {!modalMode && <BackButtonStyled onClick={onDismiss} />}
        <span>
          <Trans>Error</Trans>
        </span>
        {!modalMode ? <div></div> : <CloseIcon onClick={onDismiss} />}
      </Header>
      <Body>
        <AlertIcon size={64} />
        <Text>{message}</Text>
      </Body>
      <ButtonPrimary onClick={onDismiss}>
        <Trans>Dismiss</Trans>
      </ButtonPrimary>
    </Wrapper>
  )
}
