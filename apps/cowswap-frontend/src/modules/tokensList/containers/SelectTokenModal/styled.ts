import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: var(${UI.COLOR_CONTAINER_BG_01});
  border-radius: 20px;
`

export const Row = styled.div`
  margin: 0 20px 15px 20px;
`

export const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px 20px 0 20px;
  margin-bottom: 15px;

  > h3 {
    font-size: 16px;
    font-weight: 500;
    margin: 0;
  }

  > button {
    margin: 0;
    padding: 0;
    border: none;
    outline: none;
    background: none;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s ease-in-out;

    > svg {
      color: var(${UI.COLOR_TEXT1});
    }

    &:hover {
      opacity: 1;
    }
  }
`

export const SearchInput = styled.input`
  width: 100%;
  outline: none;
  border-radius: 20px;
  color: var(${UI.COLOR_TEXT1});
  padding: 16px;
  border: 1px solid var(${UI.COLOR_GREY});
  -webkit-appearance: none;
  transition: border 100ms;
  background: transparent;

  font-size: 18px;

  ::placeholder {
    color: var(${UI.COLOR_LINK});
  }

  :focus {
    border: 1px solid var(${UI.COLOR_CONTAINER_BG_02});
    outline: none;
  }
`

export const ActionButton = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  padding: 20px 0;
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT1});
  background: none;
  border: 0;
  outline: none;

  &:hover {
    opacity: 0.7;
  }
`
