import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { CloseIconButton } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const Container = styled.header`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  padding: 0 0 16px;
  margin: 0 0 24px;
  border-bottom: 1px solid ${({ theme }) => theme.grey1};
  color: inherit;
`

const Title = styled.b`
  font-size: 21px;
  font-weight: 600;
`

interface ConfirmationModalHeaderProps {
  children: ReactNode
  onCloseClick: Command
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ConfirmationModalHeader({ children, onCloseClick }: ConfirmationModalHeaderProps) {
  return (
    <Container>
      <Title>{children}</Title>
      <CloseIconButton closeOnEscape={false} onClick={onCloseClick} />
    </Container>
  )
}
