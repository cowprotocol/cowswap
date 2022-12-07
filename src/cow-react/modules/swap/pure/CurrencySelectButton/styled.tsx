import styled from 'styled-components/macro'
import { ReactComponent as DropDown } from 'assets/images/dropdown.svg'
import { lighten, transparentize } from 'polished'

export const CurrencySelectWrapper = styled.button<{ isLoading: boolean; stubbed: boolean; readonlyMode: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  gap: 6px;
  border: 0;
  outline: none;
  background-color: ${({ theme, stubbed }) => (stubbed ? lighten(0.1, theme.bg2) : theme.bg1)};
  color: ${({ stubbed, theme }) => (stubbed ? theme.white : theme.text1)};
  box-shadow: ${({ theme }) =>
    theme.darkMode ? `0px 4px 8px ${theme.black}` : `0px 4px 8px ${transparentize(0.96, theme.text1)}`};
  opacity: ${({ isLoading }) => (isLoading ? 0.6 : 1)};
  pointer-events: ${({ readonlyMode }) => (readonlyMode ? 'none' : '')};
  border-radius: 16px;
  padding: 6px;
  transition: background-color 0.15s ease-in-out;

  &:hover {
    // TODO: Check what 'readonlyMode' does and proper style it.
    background-color: ${({ readonlyMode, stubbed, theme }) =>
      readonlyMode ? 'red' : stubbed ? lighten(0.1, theme.bg2) : lighten(0.1, theme.bg1)};
  }
`

export const ArrowDown = styled(DropDown)<{ stubbed?: boolean }>`
  margin: 0 3px;

  > path {
    stroke: ${({ stubbed, theme }) => (stubbed ? theme.white : theme.text1)};
    stroke-width: 2px;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-left: auto;
  `};
`

export const CurrencySymbol = styled.div<{ stubbed: boolean }>`
  font-size: 19px;
  font-weight: 500;
  white-space: nowrap;
  color: ${({ stubbed, theme }) => (stubbed ? theme.white : theme.text1)};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 16px;
    word-break: break-word;
    white-space: normal;
    text-align: left;
  `};
`
