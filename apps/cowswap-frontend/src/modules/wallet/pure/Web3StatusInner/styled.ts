import { ButtonSecondary } from '@cowprotocol/ui'

import { darken } from 'polished'
import { Activity } from 'react-feather'
import styled, { css } from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const Web3StatusGeneric = styled(ButtonSecondary)``

export const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.red1};
  border: 1px solid ${({ theme }) => theme.red1};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
`

export const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
  > svg {
    display: ${({ theme }) => (theme.isInjectedWidgetMode ? '' : 'none')};
  }

  ${({ theme }) =>
    theme.isInjectedWidgetMode &&
    `
      margin: 0;
      padding: 6px 12px;
      background: 0;
      border: 0;
      font-size: 14px;
      font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
      color: var(${UI.COLOR_TEXT1})!important;
      transition: all 0.2s ease-in-out;
      gap: 6px;
      opacity: 0.7;

      &:hover {
        background: var(${UI.COLOR_GREY});
      }

      > svg {
        --size: var(${UI.ICON_SIZE_SMALL});
        height: var(--size);
        width: var(--size);
        margin: 0;
      }

      > svg > path {
        fill: var(${UI.COLOR_TEXT1});
      }
  `}
`

export const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean; clickDisabled?: boolean }>`
  background-color: var(${UI.COLOR_GREY});
  border: 1px solid transparent;
  color: var(${UI.COLOR_TEXT1});
  font-weight: 500;

  &:hover {
    background-color: var(${UI.COLOR_GREY});
    color: var(${UI.COLOR_TEXT1});
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
  color: var(${UI.COLOR_TEXT1});
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
      stroke: ${({ theme }) => theme.text3};
    }
  }
`
