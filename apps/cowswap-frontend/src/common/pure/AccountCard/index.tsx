import { UI, ExternalLink, ButtonPrimary, Media } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

export const ExtLink = styled(ExternalLink)`
  color: var(${UI.COLOR_TEXT_OPACITY_70});

  &:hover,
  &:focus {
    color: var(${UI.COLOR_PRIMARY_PAPER});
  }
`

export const Card = styled.div<{ showLoader?: boolean }>`
  display: flex;
  flex-flow: row wrap;
  flex: 1;
  margin: 0;
  background: var(${UI.COLOR_PAPER});
  box-shadow: none;
  padding: 24px;
  gap: 24px 0;
  border-radius: 16px;
  border: none;
  align-items: flex-end;

  > * {
    transition: opacity 200ms ease-out;
  }

  ${({ showLoader, theme }) =>
    showLoader &&
    css`
      position: relative;
      overflow: hidden;
      > * {
        opacity: 0;
      }
      &::after {
        z-index: 2;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        ${theme.shimmer};
        content: '';
      }
    `}

  ${Media.upToSmall()} {
    min-height: 130px;
    padding: 24px 16px;
  }

  ${ButtonPrimary} {
    gap: 8px;

    > svg {
      height: 100%;
      width: 16px;
      object-fit: contain;
      margin: 0;
      color: inherit;
      transform: translateX(0);
      transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;

      > path {
        fill: currentColor;
      }
    }

    &:hover > svg {
      transform: translateX(2px);
    }
  }
`
