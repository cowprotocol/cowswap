import { isInjectedWidget } from '@cowprotocol/common-utils'
import { ProductLogo, ProductVariant } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import styled, { keyframes, css } from 'styled-components/macro'

const pulse = keyframes`
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
`

const jump = keyframes`
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
`

const sweepingLight = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getGradientColors = (darkMode: boolean) =>
  darkMode
    ? `
      rgba(44, 46, 112, 0) 0%,
      rgba(44, 46, 112, 0.1) 20%,
      rgba(44, 46, 112, 0.2) 50%,
      rgba(44, 46, 112, 0.1) 80%,
      rgba(44, 46, 112, 0) 100%
    `
    : `
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.1) 20%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.1) 80%,
      rgba(255, 255, 255, 0) 100%
    `

const LoadingWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  position: fixed;
  background: ${({ theme }) =>
    theme.isInjectedWidgetMode ? 'transparent' : transparentize(theme.darkMode ? '#0E0F2D' : '#65D9FF', 0.1)};
  z-index: 99;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(3px);

  ${({ theme }) =>
    !theme.isInjectedWidgetMode &&
    css`
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 200%;
        height: 100%;
        background: linear-gradient(90deg, ${({ theme }) => getGradientColors(theme.darkMode)});
        animation: ${sweepingLight} 2s infinite;
        pointer-events: none;
        z-index: 1;
      }
    `}

  > span {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    position: relative;
    animation: ${pulse} 1s infinite ease-in-out;
    transform-style: preserve-3d;
    backface-visibility: visible;
    overflow: hidden;

    > svg {
    }

    > svg > g {
      fill: currentColor;
    }
  }

  > p {
    display: block;
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 400;
    letter-spacing: 4px;
    margin: ${({ theme }) => (theme.isInjectedWidgetMode ? '0 auto' : '14px auto 0')};
    color: ${({ theme }) => theme.text};
  }

  .dots {
    display: inline-block;
    font-size: 20px;
    letter-spacing: 3px;

    & span {
      display: inline-block;
      font-weight: 300;
      animation: ${jump} 1.4s infinite;
    }

    & span:nth-child(2) {
      animation-delay: 0.2s;
    }

    & span:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const LoadingApp = () => {
  const isInjectedWidgetMode = isInjectedWidget()

  return (
    <LoadingWrapper>
      {!isInjectedWidgetMode && (
        <span>
          <ProductLogo variant={ProductVariant.CowSwap} height={100} logoIconOnly />
        </span>
      )}
      <p>
        Loading
        <span className="dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    </LoadingWrapper>
  )
}
