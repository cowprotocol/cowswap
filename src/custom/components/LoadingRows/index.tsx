import styled, { keyframes } from 'styled-components/macro'

const loadingAnimation = keyframes`
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

export default styled.div`
  display: grid;
  min-width: 75%;
  max-width: 100%;
  grid-gap: 1em;
  align-items: center;
  grid-template-columns: 50px minmax(80px, auto) minmax(70px, 120px) repeat(2, 55px) 80px;

  & > div {
    animation: ${loadingAnimation} 1.5s infinite;
    animation-fill-mode: both;
    background: linear-gradient(
      to left,
      ${({ theme }) => theme.bg1} 25%,
      ${({ theme }) => theme.bg2} 50%,
      ${({ theme }) => theme.bg1} 75%
    );
    background-size: 400%;
    border-radius: 12px;
    height: 0.6rem;
    margin: 5px 0;
    will-change: background-position;
  }
`
