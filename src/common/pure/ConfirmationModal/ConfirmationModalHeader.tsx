import { ReactNode } from 'react'

import { X as CloseIcon } from 'react-feather'
import styled from 'styled-components/macro'

const Container = styled.header`
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 0 0 16px;
  margin: 0 0 24px;
  border-bottom: 1px solid ${({ theme }) => theme.grey1};
  color: ${({ theme }) => theme.text1};
`

const Title = styled.b`
  font-size: 21px;
  font-weight: 600;
`

const Close = styled(CloseIcon)`
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

interface ConfirmationModalHeaderProps {
  children: ReactNode
  onCloseClick: () => void
}

export function ConfirmationModalHeader({ children, onCloseClick }: ConfirmationModalHeaderProps) {
  return (
    <Container>
      <Title>{children}</Title>
      <Close onClick={onCloseClick} />
    </Container>
  )
}
