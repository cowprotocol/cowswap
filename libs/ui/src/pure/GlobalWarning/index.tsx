import { ReactNode } from 'react'

import { AlertTriangle, X } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from '../../enum'

const StyledClose = styled(X)`
  :hover {
    cursor: pointer;
  }
`

const Container = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  font-size: 12px;
  color: var(${UI.COLOR_BUTTON_TEXT});
  background-color: var(${UI.COLOR_PRIMARY});
  border-radius: ${({ theme }) => (theme.isInjectedWidgetMode ? '8px' : '')};
  margin-bottom: ${({ theme }) => (theme.isInjectedWidgetMode ? '10px' : '')};
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  p {
    margin: 0;
  }
`

export function GlobalWarning({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <Container>
      <Wrapper>
        <AlertTriangle />
        {children}
      </Wrapper>
      {onClose && <StyledClose onClick={onClose} />}
    </Container>
  )
}
