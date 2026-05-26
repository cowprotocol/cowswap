import { ButtonSecondary, UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

import { WalletStatusButtonVariant } from './Web3Status.container'

// TODO: Finish moving around styles and implementing regularButton...

export const Web3StatusGeneric = styled(ButtonSecondary)<{ $variant: WalletStatusButtonVariant }>`
  ${({ $variant }) =>
    $variant === 'widget'
      ? css`
          //margin: 0;
          padding: 5px 12px;
          //border: 0;
          font-size: 14px !important;
          font-weight: var(${UI.FONT_WEIGHT_MEDIUM}) !important;
          background: transparent !important;
          color: inherit !important;
          transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;
          opacity: 0.7;
          border-radius: 21px;
          width: auto;
          margin-left: auto;
          margin-right: 16px;

          &:hover,
          &:active,
          &:focus {
            opacity: 1 !important;
            background: var(${UI.COLOR_PAPER_DARKER}) !important;
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
          flex: 1;
          border: 3px solid transparent !important;
          background-clip: padding-box !important;
          min-height: 42px;
          border-radius: ${$variant === 'navBarAffiliate' ? '6px 21px 21px 6px' : '21px'};

          &:hover {
            background-color: var(${UI.COLOR_PRIMARY_LIGHTER}) !important;
            color: var(--cow-color-button-text) !important;
          }
        `}

  // color: inherit;
  // height: ${({ theme }) => (theme.isWidget ? 'initial' : '100%')};
  // max-height: 100%;
  // display: flex;
  // padding: 0;
  // margin: 0;
  // justify-content: center;
  // border: ${({ theme }) => (theme.isWidget ? '0' : '3px solid transparent !important')};
  // background: transparent;

  // height: auto;
  // padding: ${({ theme }) => (theme.isWidget ? '5px 12px' : '0 16px')};
  // width: max-content;
  gap: 6px;
  // transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;
  // background: var(${UI.COLOR_PRIMARY});
  // color: var(${UI.COLOR_BUTTON_TEXT});
  // min-height:  ${({ theme }) => (theme.isWidget ? 'initial' : '42px')};

  &:disabled {
    cursor: not-allowed;
  }
`

export const Web3StatusConnect = styled(Web3StatusGeneric)<{ $variant: WalletStatusButtonVariant }>`
  > svg {
    display: ${({ theme }) => (theme.isWidget ? '' : 'none')};
  }

  ${({ theme }) =>
    theme.isWidget &&
    css`
      //margin: 0;
      //padding: 6px 12px;
      //border: 0;
      //font-size: 14px !important;
      //font-weight: var(${UI.FONT_WEIGHT_MEDIUM}) !important;
      background: transparent !important;
      color: inherit !important;
      transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;
      opacity: 0.7;

      &:hover,
      &:active,
      &:focus {
        opacity: 1 !important;
        background: var(${UI.COLOR_PAPER_DARKER}) !important;
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
    `}
`

export const Web3StatusConnected = styled(Web3StatusGeneric)<{ $variant: WalletStatusButtonVariant }>`
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  background-clip: padding-box !important;

  &:hover {
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});
  }

  > div > svg > path {
    stroke: currentColor;
    opacity: 0.7;
  }

  //background-color: var(${UI.COLOR_PAPER_DARKER});
  //border: 1px solid transparent;
  //color: inherit;
  // font-weight: 500;

  &:hover {
    background-color: var(${UI.COLOR_PAPER_DARKEST});
    color: inherit;
  }
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
