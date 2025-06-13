import { ReactNode } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import { AlertTriangle, X } from 'react-feather'
import styled from 'styled-components/macro'

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StyledClose = styled(X as any)`
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    cursor: pointer;
    opacity: 1;
  }

  ${Media.upToSmall()} {
    margin: 0 0 auto;
  }
`

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StyledAlertTriangle = styled(AlertTriangle as any)`
  flex-shrink: 0;
`

const Container = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  font-size: 12px;
  color: var(${UI.COLOR_BUTTON_TEXT});
  background-color: var(${UI.COLOR_PRIMARY});
  border-radius: ${({ theme }) => (theme.isInjectedWidgetMode ? '8px' : '')};
  margin-bottom: ${({ theme }) => (theme.isInjectedWidgetMode ? '10px' : '')};

  ${Media.upToSmall()} {
    padding: 12px 8px;
  }
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  p {
    margin: 0;
    line-height: 1.2;

    ${Media.upToSmall()} {
      line-height: 1.4;
    }
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function GlobalWarning({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <Container>
      <Wrapper>
        <StyledAlertTriangle />
        {children}
      </Wrapper>
      {onClose && <StyledClose onClick={onClose} />}
    </Container>
  )
}
