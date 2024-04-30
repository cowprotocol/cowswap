import DropDown from '@cowprotocol/assets/images/dropdown.svg?react'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ArrowDown = styled((props) => <DropDown {...props} />)<{ $stubbed?: boolean }>`
  margin: 0 3px;
  width: 12px;
  height: 7px;
  min-width: 12px;
  min-height: 7px;

  > path {
    stroke: currentColor;
    stroke-width: 2px;
    transition: stroke var(${UI.ANIMATION_DURATION}) ease-in-out;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-left: auto;
  `};
`

export const CurrencySelectWrapper = styled.button<{ isLoading: boolean; $stubbed: boolean; readonlyMode: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${({ readonlyMode }) => (readonlyMode ? '' : 'pointer')};
  gap: 6px;
  border: 0;
  outline: none;
  background: ${({ $stubbed }) => ($stubbed ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_PAPER})`)};
  color: ${({ $stubbed }) => ($stubbed ? `var(${UI.COLOR_BUTTON_TEXT})` : `var(${UI.COLOR_TEXT_PAPER})`)};
  box-shadow: var(${UI.BOX_SHADOW_2});
  opacity: ${({ isLoading }) => (isLoading ? 0.6 : 1)};
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  padding: 6px;
  ${({ readonlyMode }) => (readonlyMode ? 'padding-right: 10px;' : '')}
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out, color var(${UI.ANIMATION_DURATION}) ease-in-out;
  max-width: 190px;

  &:hover {
    color: ${({ $stubbed, readonlyMode }) =>
      readonlyMode ? '' : $stubbed ? `var(${UI.COLOR_BUTTON_TEXT})` : `var(${UI.COLOR_BUTTON_TEXT})`};
    background: ${({ readonlyMode, $stubbed }) =>
      readonlyMode ? '' : $stubbed ? `var(${UI.COLOR_PRIMARY_LIGHTER});` : `var(${UI.COLOR_PRIMARY});`};
  }

  &:hover ${ArrowDown} > path {
    transition: stroke var(${UI.ANIMATION_DURATION}) ease-in-out;
    stroke: ${({ $stubbed }) => ($stubbed ? 'currentColor' : `var(${UI.COLOR_BUTTON_TEXT})`)};
  }
`

export const CurrencySymbol = styled.div<{ $stubbed: boolean }>`
  font-size: 19px;
  font-weight: 500;
  text-align: left;
  color: inherit;
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 16px;
    word-break: break-word;
    white-space: normal;
    text-align: left;
  `};
`
