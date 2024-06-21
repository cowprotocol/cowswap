import { ProductLogo, ProductVariant } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

export const LoadingWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  position: fixed;
  background: ${({ theme }) => transparentize(theme.bg2, 0.8)};
  z-index: 99;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(3px);

  > svg {
    animation: pulse 1s infinite ease-in-out;
    transform-style: preserve-3d;
    backface-visibility: visible;
  }

  > svg > g {
    fill: currentColor;
  }

  > span {
    display: block;
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 2px;
    margin: 5px auto 0;
    color: inherit;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    20% {
      transform: scale(1.05);
    }
    30% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.05);
    }
    50% {
      transform: scale(1);
    }
    100% {
      transform: scale(1);
    }
  }
`

export const Loading: React.FC = () => {
  return (
    <LoadingWrapper>
      <ProductLogo variant={ProductVariant.CowSwap} height={100} logoIconOnly />
      <span>Loading...</span>
    </LoadingWrapper>
  )
}
