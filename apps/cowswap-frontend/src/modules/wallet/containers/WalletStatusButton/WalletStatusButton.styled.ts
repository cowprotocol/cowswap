import { ButtonSecondary, UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

import { WalletStatusButtonVariant } from './WalletStatusButton.container'

export const WalletStatusButton = styled(ButtonSecondary)<{ $variant: WalletStatusButtonVariant }>`
  gap: 6px;

  &:disabled {
    cursor: not-allowed;
  }

  ${({ $variant }) =>
    $variant === 'widget'
      ? css`
          padding: 5px 12px;
          font-size: 14px;
          font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
          transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;
          border-radius: 21px;
          width: auto;
          margin-left: auto;
          margin-right: 16px;
          opacity: 0.7;
          background: transparent;
          color: inherit;

          &:hover,
          &:active,
          &:focus {
            opacity: 1;
            background: var(${UI.COLOR_PAPER_DARKER});
            color: inherit;
          }

          > svg {
            --size: var(${UI.ICON_SIZE_SMALL});
            height: var(--size);
            width: var(--size);
            margin: 0;
          }

          > svg > path {
            fill: currentColor;
          }
        `
      : css`
          padding: 0 16px;
          border: 3px solid transparent;
          background-clip: padding-box;
          min-height: 42px;
          border-radius: ${$variant === 'navBarAffiliate' ? '6px 21px 21px 6px' : '21px'};

          ${$variant === 'regularButton'
            ? css`
                width: auto;
              `
            : css`
                flex: 1;
              `}

          &:hover,
          &:active,
          &:focus {
            background-color: var(${UI.COLOR_PRIMARY});
            background-clip: padding-box;
            color: var(--cow-color-button-text);
          }
        `}
`

export const WalletStatusButtonConnected = styled(WalletStatusButton)<{ $variant: WalletStatusButtonVariant }>`
  background-color: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
`

export const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  font-size: ${({ theme }) => (theme.isWidget ? '14px' : '16px')};
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  width: fit-content;
`

export const UnfillableWarning = styled.div`
  color: var(${UI.COLOR_DANGER});
  line-height: 0;

  > svg {
    animation: growShrink 1s ease-in-out infinite;
  }

  @keyframes growShrink {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2); /* Change to desired size */
    }
  }
`
