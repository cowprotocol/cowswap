import styled from 'styled-components/macro'

export const ThreeDots = styled.span`
  display: inline;
  white-space: nowrap;
  user-select: none;

  > span {
    animation: threeDotsPulse 1.2s ease-in-out infinite;
    color: currentColor;
  }

  > span:nth-child(2) {
    animation-delay: 0.2s;
  }

  > span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes threeDotsPulse {
    0%,
    100% {
      opacity: 0.2;
    }
    50% {
      opacity: 1;
    }
  }
`
