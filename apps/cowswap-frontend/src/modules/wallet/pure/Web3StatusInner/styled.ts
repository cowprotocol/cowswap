import { ButtonSecondary } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import { darken } from 'color2k'
import { Activity } from 'react-feather'
import styled, { css } from 'styled-components/macro'

export const Web3StatusGeneric = styled(ButtonSecondary)``

export const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: var(${UI.COLOR_DANGER});
  border: 1px solid var(${UI.COLOR_DANGER});
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(theme.red1, 0.1)};
  }
`

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
      background: transparent;
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
  font-size: ${({ theme }) => (theme.isInjectedWidgetMode ? '15px' : '1rem')};
  width: fit-content;
  font-weight: 500;
`

export const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

export const Wrapper = styled.div`
  color: inherit;
  height: ${({ theme }) => (theme.isInjectedWidgetMode ? 'initial' : '40px')};
  display: flex;
  padding: 0;
  margin: 0;
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: auto;
    height: 100%;
    margin: 0 auto;
  `};

  > button {
    height: auto;
    border-radius: 21px;
    padding: 6px 12px;
    width: max-content;
    gap: 6px;
  }

  ${Web3StatusConnected} {
    height: 100%;
    width: 100%;

    > div > svg > path {
      stroke: currentColor;
      opacity: 0.7;
    }
  }
`
