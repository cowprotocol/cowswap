import { transparentize } from 'polished'
import styled, { css } from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const blankButtonMixin = css`
  background: none;
  padding: 0;
  margin: 0;
  outline: none;
  border: 0;
  cursor: pointer;

  &:disabled {
    cursor: default;
  }
`

export const PrimaryInputBox = styled.div`
  margin: 20px 0 10px 0;
  padding: 0 20px 20px 20px;
  border-bottom: 1px solid var(${UI.COLOR_GREY});
`

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
  ${blankButtonMixin}

  > svg {
    color: var(${UI.COLOR_TEXT1});

    &:hover {
      color: var(${UI.COLOR_TEXT2});
    }
  }
`

export const ImportButton = styled.button`
  ${blankButtonMixin};

  background-color: var(${UI.COLOR_CONTAINER_BG_02});
  color: var(${UI.COLOR_WHITE});
  font-size: 16px;
  font-weight: 600;
  padding: 6px 15px;
  border-radius: 24px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: var(${UI.COLOR_LINK});
  }
`
