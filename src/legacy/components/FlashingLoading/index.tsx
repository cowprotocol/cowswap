import { transparentize } from 'polished'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import CowIcon from 'legacy/assets/cow-swap/cowprotocol.svg'

export const LoadingWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  position: fixed;
  background: ${({ theme }) => transparentize(0.8, theme.bg2)};
  z-index: 99;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(3px);

  > svg {
    animation: spin 4s infinite ease-in-out;
    transform-style: preserve-3d;
    backface-visibility: visible;
  }

  > svg > g {
    fill: ${({ theme }) => theme.text2};
  }

  > span {
    display: block;
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2px;
    margin: 5px auto 0;
    color: ${({ theme }) => theme.text2};
  }

  @keyframes spin{
    0% {
      transform: rotateX(0deg) rotateY(0deg);
    }
    
    50% {
      transform: rotateY(180deg);
    }
    
    100% {
      transform: scale(1) rotateX(0deg) rotateY(0deg);
    }
  }
`

export const Loading = <LoadingWrapper>
  <SVG src={CowIcon} width={100} height={100} />
  <span>Loading...</span>
</LoadingWrapper>
