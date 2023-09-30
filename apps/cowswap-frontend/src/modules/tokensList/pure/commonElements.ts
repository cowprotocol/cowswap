import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const PrimaryInput = styled.input`
  width: 100%;
  border: none;
  background: var(${UI.COLOR_GREY});
  font-size: 18px;
  border-radius: 20px;
  padding: 16px;
  color: var(${UI.COLOR_TEXT1});
  outline: none;

  ::placeholder {
    color: var(${UI.COLOR_TEXT1});
  }

  &:focus {
    ::placeholder {
      color: ${({ theme }) => transparentize(0.7, theme.text1)};
    }
  }
`

export const IconButton = styled.button`
  background: none;
  padding: 0;
  margin: 0;
  outline: none;
  border: 0;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }

  > svg {
    color: var(${UI.COLOR_TEXT1});

    &:hover {
      color: var(${UI.COLOR_TEXT2});
    }
  }
`
