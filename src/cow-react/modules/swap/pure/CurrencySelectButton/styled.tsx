import styled from 'styled-components/macro'
import { ReactComponent as DropDown } from 'assets/images/dropdown.svg'
import { lighten, darken } from 'polished'

export const CurrencySelectWrapper = styled.button<{ isLoading: boolean; stubbed: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  gap: 0.5rem;
  border: 0;
  outline: none;
  background-color: ${({ theme, stubbed }) => (stubbed ? lighten(0.1, theme.bg1) : theme.bg1)};
  color: ${({ theme }) => theme.text1};
  box-shadow: ${({ stubbed }) => (stubbed ? '0 6px 10px rgb(0 0 0 / 8%)' : 'none')};
  opacity: ${({ isLoading }) => (isLoading ? 0.6 : 1)};
  border-radius: 16px;
  padding: 8px;
  transition: background-color 0.15s ease-in-out;

  :hover {
    background-color: ${({ theme }) => darken(0.03, theme.bg1)};
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    justify-content: start;
  `};
`

export const ArrowDown = styled(DropDown)`
  margin: 0 5px;

  path {
    stroke: ${({ theme }) => theme.text1};
    stroke-width: 1.5px;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-left: auto;
  `};
`

export const ArrowDownStubbed = styled(DropDown)`
  margin: 0 5px;

  path {
    stroke: ${({ theme }) => theme.text2};
    stroke-width: 1.5px;
  }
`

export const CurrencySymbol = styled.div<{ stubbed: boolean }>`
  font-size: 18px;
  font-weight: 500;
  white-space: nowrap;
  color: ${({ stubbed, theme }) => (stubbed ? theme.text2 : theme.text1)};
`
