import styled from 'styled-components/macro'
import PollingUni, { StyledPolling, StyledPollingDot, StyledPollingNumber, StyledGasDot, Spinner } from './PollingMod'

export * from './PollingMod'

const Wrapper = styled.div`
  ${StyledPolling} {
    color: ${({ theme }) => theme.text1};
    position: relative;
    margin: 0;
    padding: 0;
    right: initial;
    bottom: initial;
    font-size: 11px;
    opacity: 1;

    a {
      color: ${({ theme }) => theme.text1};
      opacity: 0.5;
      transition: opacity 0.3s ease-in-out;
      text-decoration: none;

      &:hover {
        opacity: 1;
        text-decoration: underline;
      }
    }

    ${StyledPollingNumber}:hover + ${StyledPollingDot} {
      opacity: 1;
    }

    ${StyledPollingNumber} > a {
      opacity: 1;
      color: ${({ theme }) => theme.text1};

      &:hover {
        opacity: 1;
        text-decoration: underline;
      }
    }
  }

  ${StyledGasDot},
  ${StyledPollingDot} {
    background: ${({ theme }) => theme.text1};
  }

  ${StyledPollingDot} {
    opacity: 0.5;
  }

  ${StyledGasDot} {
    width: 4px;
    height: 4px;
    margin: 0 0 0 8px;
  }

  ${Spinner} {
    border-left: 2px solid ${({ theme }) => theme.text1};
  }
`

export function Polling() {
  return (
    <Wrapper>
      <PollingUni />
    </Wrapper>
  )
}
