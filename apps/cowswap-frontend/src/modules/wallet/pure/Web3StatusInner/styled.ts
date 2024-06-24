import { ButtonSecondary } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

export const Web3StatusGeneric = styled(ButtonSecondary)``

export const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
  > svg {
    display: ${({ theme }) => (theme.isInjectedWidgetMode ? '' : 'none')};
  }

  ${({ theme }) =>
    theme.isInjectedWidgetMode &&
    css`
      margin: 0;
      padding: 6px 12px;
      border: 0;
      font-size: 14px;
      font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
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

export const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean; clickDisabled?: boolean }>`
  background-color: var(${UI.COLOR_PAPER_DARKER});
  border: 1px solid transparent;
  color: inherit;
  font-weight: 500;

  &:hover {
    background-color: var(${UI.COLOR_PAPER_DARKEST});
    color: inherit;
  }

  ${({ clickDisabled }) =>
    clickDisabled &&
    css`
      cursor: not-allowed;
      pointer-events: none;
    `}
`

export const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  font-size: ${({ theme }) => (theme.isInjectedWidgetMode ? '15px' : '16px')};
  width: fit-content;
  font-weight: 500;
`

export const Wrapper = styled.div`
  color: inherit;
  height: ${({ theme }) => (theme.isInjectedWidgetMode ? 'initial' : '100%')};
  max-height: 100%;
  display: flex;
  padding: 0;
  margin: 0;
  justify-content: center;
  border: 2px solid transparent;

  > button {
    height: auto;
    border-radius: 28px;
    padding: 8px 16px;
    width: max-content;
    gap: 6px;
    transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});

    &:hover {
      background: var(${UI.COLOR_PRIMARY_LIGHTER});
    }
  }

  > ${Web3StatusConnected} {
    background: var(${UI.COLOR_PAPER});
    color: var(${UI.COLOR_TEXT});

    &:hover {
      background: var(${UI.COLOR_PRIMARY});
      color: var(${UI.COLOR_BUTTON_TEXT});
    }

    > div > svg > path {
      stroke: currentColor;
      opacity: 0.7;
    }
  }
`
