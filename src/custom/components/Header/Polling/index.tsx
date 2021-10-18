import styled from 'styled-components/macro'
import PollingUni, { StyledPolling, StyledPollingDot, Spinner } from './PollingMod'

export * from './PollingMod'

const Wrapper = styled.div`
  ${StyledPolling} {
    color: ${({ theme }) => theme.footerColor};
    opacity: 0.3;

    &:hover {
      opacity: 1;
    }
  }

  ${StyledPollingDot} {
    background: ${({ theme }) => theme.footerColor};
  }

  ${Spinner} {
    border-left: 2px solid ${({ theme }) => theme.footerColor};
  }
`

export default function Polling() {
  return (
    <Wrapper>
      <PollingUni />
    </Wrapper>
  )
}
