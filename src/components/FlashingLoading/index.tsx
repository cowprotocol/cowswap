import styled from 'styled-components/macro'

export const LoadingWrapper = styled.div`
  animation: blinker 2s linear infinite;

  @keyframes blinker {
    50% {
      opacity: 0;
    }
  }
`

export const Loading = <LoadingWrapper>Loading...</LoadingWrapper>
