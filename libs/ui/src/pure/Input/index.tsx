import styled from 'styled-components/macro'

import { UI } from '../../enum'

export const SearchInput = styled.input`
  position: relative;
  display: flex;
  padding: 16px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  outline: none;
  background: var(${UI.COLOR_PAPER_DARKER});
  color: inherit;
  border: 1px solid var(${UI.COLOR_BORDER});
  appearance: none;
  font-size: 16px;
  border-radius: 12px;

  ::placeholder {
    color: inherit;
    opacity: 0.7;
  }

  transition: border 100ms;

  :focus {
    border: 1px solid var(${UI.COLOR_PRIMARY});
    outline: none;
  }
`
