import { TokenLogo } from '@cowprotocol/tokens'
import { UI } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

interface IconSpinnerProps {
  currency?: Currency | null
  image?: string
  size?: number
  children?: React.ReactNode
  bgColor?: UI
  spinnerWidth?: number
}

const Wrapper = styled.div<{ size: number; spinnerWidth: number; bgColor: UI }>`
  --bgColor: ${({ bgColor }) => `var(${bgColor})`};
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  min-width: ${({ size }) => size}px;
  min-height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;

  &:before {
    content: '';
    position: absolute;
    top: calc(-1 * ${({ spinnerWidth }) => spinnerWidth}px);
    left: calc(-1 * ${({ spinnerWidth }) => spinnerWidth}px);
    width: calc(100% + 2 * ${({ spinnerWidth }) => spinnerWidth}px);
    height: calc(100% + 2 * ${({ spinnerWidth }) => spinnerWidth}px);
    border-radius: 50%;
    background: conic-gradient(from 0deg at 50% 50%, var(${UI.COLOR_BORDER}) 0%, var(${UI.COLOR_LINK}) 100%);
    animation: spin 2s linear infinite;
    z-index: 1;
  }

  img,
  svg,
  > span {
    object-fit: contain;
    z-index: 2;
    position: relative;
    border: ${({ spinnerWidth }) => spinnerWidth}px solid var(${UI.COLOR_PAPER});
    border-radius: ${({ size }) => size}px;
    background-color: var(--bgColor);
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function IconSpinner({
  currency,
  image,
  size = 24,
  children,
  bgColor = UI.COLOR_PAPER,
  spinnerWidth = 2,
}: IconSpinnerProps) {
  return (
    <Wrapper size={size} spinnerWidth={spinnerWidth} bgColor={bgColor}>
      {(() => {
        if (currency) {
          return <TokenLogo token={currency} size={size} />
        } else if (image) {
          return <img src={image} alt="Spinning icon" width={size} height={size} />
        } else if (children) {
          return <span>{children}</span>
        }
        return <span />
      })()}
    </Wrapper>
  )
}
