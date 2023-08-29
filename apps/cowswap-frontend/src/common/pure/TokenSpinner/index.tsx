import { Currency } from '@uniswap/sdk-core';

import styled from 'styled-components/macro'

import { CurrencyLogo } from 'common/pure/CurrencyLogo'


type TokenSpinnerProps = {
  currency: Currency | null | undefined;
  size?: number
};

const Wrapper = styled.div<{ size?: number }>`
  --size: ${({ size }) => size}px;
  --spinnerWidth: 2px;
  display: flex;
  position: relative;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);

  &:before {
    content: "";
    position: absolute;
    top: calc(-1 * var(--spinnerWidth));
    left: calc(-1 * var(--spinnerWidth));
    width: calc(100% + 2 * var(--spinnerWidth));
    height: calc(100% + 2 * var(--spinnerWidth));
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
    border: var(--spinnerWidth) solid var(--cow-container-bg-01);
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

export function TokenSpinner({ currency, size = 24 }: TokenSpinnerProps) {
  return (
    <Wrapper size={size}>
      <CurrencyLogo currency={currency} size="100%" />
    </Wrapper>
  );
}
