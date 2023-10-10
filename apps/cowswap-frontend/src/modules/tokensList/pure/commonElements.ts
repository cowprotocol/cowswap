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

export const CommonListContainer = styled.div`
  display: block;
  height: 100vh;
  width: 100%;
  overflow: auto;

  ${({ theme }) => theme.colorScrollbar};
`
