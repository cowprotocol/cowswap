import { ReactElement } from 'react'

import styled, { keyframes } from 'styled-components/macro'

import { ProductLogo, ProductVariant } from '../ProductLogo'

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

const LoaderContainer = styled.div<{ minHeight?: string; gap?: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: inherit;
  min-height: ${({ minHeight }) => minHeight || '200px'};
  gap: ${({ gap }) => gap || '16px'};

  .logo-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${pulse} 1s infinite ease-in-out;
    transform-style: preserve-3d;
    backface-visibility: visible;
  }

  > p {
    display: block;
    text-transform: capitalize;
    font-size: 14px;
    font-weight: 400;
    font-family: inherit;
    letter-spacing: 2px;
    margin: 0;
    color: currentColor;
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

export interface ProductLogoLoaderProps {
  text?: string
  logoHeight?: number
  variant?: ProductVariant
  minHeight?: string
  gap?: string
}

export function ProductLogoLoader({
  text = 'Loading',
  logoHeight = 60,
  variant = ProductVariant.CowSwap,
  minHeight,
  gap,
}: ProductLogoLoaderProps): ReactElement {
  return (
    <LoaderContainer minHeight={minHeight} gap={gap}>
      <div className="logo-wrapper">
        <ProductLogo variant={variant} height={logoHeight} logoIconOnly />
      </div>
      <p>
        {text}
        <span className="dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    </LoaderContainer>
  )
}
