import { Currency } from '@uniswap/sdk-core';

import styled from 'styled-components/macro';

import { CurrencyLogo } from 'common/pure/CurrencyLogo';

type IconSpinnerProps = {
  currency?: Currency | null;
  image?: string;
  size?: number;
};

const Wrapper = styled.div<{ size: number; spinnerWidth: number }>`
  display: flex;
  position: relative;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;

  &:before {
    content: "";
    position: absolute;
    top: calc(-1 * ${({ spinnerWidth }) => spinnerWidth}px);
    left: calc(-1 * ${({ spinnerWidth }) => spinnerWidth}px);
    width: calc(100% + 2 * ${({ spinnerWidth }) => spinnerWidth}px);
    height: calc(100% + 2 * ${({ spinnerWidth }) => spinnerWidth}px);
    border-radius: 50%;
    background: conic-gradient(from 0deg at 50% 50%, var(--cow-color-border) 0%, var(--cow-color-link) 100%);
    animation: spin 2s linear infinite;
    z-index: 1;
  }

  > img,
  > svg {
    object-fit: contain;
    z-index: 2;
    position: relative;
    border: ${({ spinnerWidth }) => spinnerWidth}px solid var(--cow-container-bg-01);
    border-radius: ${({ size }) => size}px;
    background-color: var(--cow-container-bg-01);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export function IconSpinner({ currency, image, size = 24 }: IconSpinnerProps) {
  const spinnerWidth = 2;

  return (
    <Wrapper size={size} spinnerWidth={spinnerWidth}>
      {currency ? <CurrencyLogo currency={currency} size="100%" /> : <img src={image} alt="Spinning icon" width={size} height={size} />}
    </Wrapper>
  );
}
