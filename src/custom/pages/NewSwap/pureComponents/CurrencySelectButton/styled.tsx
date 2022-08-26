import styled from 'styled-components/macro'
import { ReactComponent as DropDown } from 'assets/images/dropdown.svg'

export const CurrencySelectWrapper = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;

  cursor: pointer;
  gap: 0.5rem;
  border: 0;
  outline: none;
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 16px;
  padding: 8px;
  transition: background-color 0.15s;

  :hover {
    background-color: ${({ theme }) => theme.primary1} !important;
  }
`

export const ArrowDown = styled(DropDown)`
  margin: 0 5px;

  path {
    stroke: ${({ theme }) => theme.text1};
    stroke-width: 1.5px;
  }
`

export const CurrencySymbol = styled.div`
  font-size: 18px;
  font-weight: 500;
  text-transform: uppercase;
  color: ${({ theme }) => theme.text1};
`
