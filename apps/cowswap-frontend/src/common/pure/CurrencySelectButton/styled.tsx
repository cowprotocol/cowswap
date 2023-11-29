import { ReactComponent as DropDown } from '@cowprotocol/assets/images/dropdown.svg'
import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ArrowDown = styled(DropDown)<{ $stubbed?: boolean }>`
  margin: 0 3px;
  width: 12px;
  height: 7px;
  min-width: 12px;
  min-height: 7px;

  > path {
    stroke: ${({ $stubbed }) => ($stubbed ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_TEXT})`)};
    stroke-width: 2px;
    transition: stroke 0.15s ease-in-out;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-left: auto;
  `};
`

export const CurrencySelectWrapper = styled.button<{ isLoading: boolean; $stubbed: boolean; readonlyMode: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  gap: 6px;
  border: 0;
  outline: none;
  background-color: ${({ $stubbed }) => ($stubbed ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_PAPER})`)};
  color: ${({ $stubbed }) => ($stubbed ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_TEXT})`)};
  box-shadow: var(${UI.BOX_SHADOW_2});
  opacity: ${({ isLoading }) => (isLoading ? 0.6 : 1)};
  pointer-events: ${({ readonlyMode }) => (readonlyMode ? 'none' : '')};
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  padding: 6px;
  transition: background-color 0.15s ease-in-out;
  max-width: 190px;

  &:hover {
    // TODO: Check what 'readonlyMode' does and proper style it.
    color: ${({ $stubbed }) => ($stubbed ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_BUTTON_TEXT})`)};
    background-color: ${({ readonlyMode, $stubbed }) =>
      readonlyMode
        ? `var(${UI.COLOR_DANGER});`
        : $stubbed
        ? `var(${UI.COLOR_PAPER_DARKER});`
        : `var(${UI.COLOR_PRIMARY});`};
  }

  &:hover ${ArrowDown} > path {
    stroke: ${({ $stubbed }) => ($stubbed ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_BUTTON_TEXT})`)};
  }
`

export const CurrencySymbol = styled.div<{ $stubbed: boolean }>`
  font-size: 19px;
  font-weight: 500;
  text-align: left;
  color: inherit;
  transition: color 0.15s ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 16px;
    word-break: break-word;
    white-space: normal;
    text-align: left;
  `};
`
