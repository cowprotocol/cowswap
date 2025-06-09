import { ReactElement } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'
import { ProductLogoLoader, ProductVariant } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import styled, { keyframes, css } from 'styled-components/macro'

const sweepingLight = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
`

const getGradientColors = (darkMode: boolean): string =>
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
    theme.isWidget ? 'transparent' : transparentize(theme.darkMode ? '#0E0F2D' : '#65D9FF', 0.1)};
  z-index: 99;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(3px);

  ${({ theme }) =>
    !theme.isWidget &&
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
`

export const LoadingApp = (): ReactElement => {
  const isWidget = isInjectedWidget()

  return (
    <LoadingWrapper>
      <ProductLogoLoader
        variant={ProductVariant.CowSwap}
        logoHeight={isWidget ? 60 : 100}
        text="Loading"
        minHeight="auto"
        gap="14px"
      />
    </LoadingWrapper>
  )
}
