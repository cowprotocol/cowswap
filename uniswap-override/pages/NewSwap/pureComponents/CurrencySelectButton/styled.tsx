import styled from 'styled-components/macro'
import { ReactComponent as DropDown } from 'assets/images/dropdown.svg'

export const CurrencySelectWrapper = styled.button<{ isLoading: boolean; stubbed: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  cursor: pointer;
  gap: 0.5rem;
  border: 0;
  outline: none;
  background-color: ${({ theme, stubbed }) => (stubbed ? theme.primary1 : theme.bg1)};
  box-shadow: 0 6px 10px rgb(0 0 0 / 8%);
  opacity: ${({ isLoading }) => (isLoading ? 0.6 : 1)};
  border-radius: 16px;
  padding: 8px;
  transition: background-color 0.15s;

  :hover {
    background-color: ${({ theme }) => theme.primary1} !important;
    box-shadow: none !important;
    transform: scale(0.99);
  }
`

export const ArrowDown = styled(DropDown)`
  margin: 0 5px;

  path {
    stroke: ${({ theme }) => theme.text1};
    stroke-width: 1.5px;
  }
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
  text-transform: ${({ stubbed }) => (stubbed ? 'none' : 'uppercase')};
  color: ${({ stubbed, theme }) => (stubbed ? theme.text2 : theme.text1)};
`
