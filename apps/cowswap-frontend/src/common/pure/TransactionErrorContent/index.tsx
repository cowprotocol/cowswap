import { Trans } from '@lingui/macro'
import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'

import { ButtonPrimary } from 'legacy/components/Button'
import { CloseIcon } from 'legacy/theme'

const Wrapper = styled.div`
  width: 100%;
  padding: 15px;
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
  margin: 40px 0;
`

const Text = styled.div`
  color: ${({ theme }) => theme.red1};
  font-weight: 500;
  font-size: 16px;
`

const AlertIcon = styled(AlertTriangle)`
  color: ${({ theme }) => theme.red1};
  strokewidth: 1.5;
  margin-bottom: 15px;
`

export interface TransactionErrorContentProps {
  message: JSX.Element | string
  onDismiss(): void
}

export function TransactionErrorContent(props: TransactionErrorContentProps) {
  const { message, onDismiss } = props

  return (
    <Wrapper>
      <Header>
        <span>
          <Trans>Error</Trans>
        </span>
        <CloseIcon onClick={onDismiss} />
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
