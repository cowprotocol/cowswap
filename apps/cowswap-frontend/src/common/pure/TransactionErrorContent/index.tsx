import React from 'react'

import { BackButton, ButtonPrimary } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'

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
  color: var(${UI.COLOR_DANGER});
  font-weight: 500;
  font-size: 16px;
`

const AlertIcon = styled(AlertTriangle)`
  color: var(${UI.COLOR_DANGER});
  stroke-width: 1.5;
  margin-bottom: 15px;
`

export interface TransactionErrorContentProps {
  message: JSX.Element | string
  onDismiss(): void
  mode?: 'screen' | 'modal'
}

export function TransactionErrorContent(props: TransactionErrorContentProps) {
  const { message, onDismiss, mode } = props

  const isScreenMode = mode === 'screen'

  return (
    <Wrapper>
      <Header>
        {isScreenMode && <BackButton onClick={onDismiss} />}
        <span>
          <Trans>Error</Trans>
        </span>
        {isScreenMode ? <div></div> : <CloseIcon onClick={onDismiss} />}
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
