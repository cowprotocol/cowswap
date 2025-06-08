import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'

import { X as CloseIcon } from 'react-feather'
import styled from 'styled-components/macro'

const Container = styled.header`
  display: flex;
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

const Close = styled(CloseIcon)`
  height: 28px;
  width: 28px;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    cursor: pointer;
    opacity: 1;
  }

  > line {
    stroke: var(${UI.COLOR_TEXT});
  }
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
      <Close onClick={onCloseClick} />
    </Container>
  )
}
