import { UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

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
  ${blankButtonMixin};

  color: inherit;
  opacity: 0.6;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 1;
  }

  > svg {
    color: inherit;
  }
`

export const ImportButton = styled.button`
  ${blankButtonMixin};

  background: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_BUTTON_TEXT});
  font-size: 16px;
  font-weight: 600;
  padding: 6px 15px;
  border-radius: 24px;
  cursor: pointer;
  transition: background-color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    background-color: var(${UI.COLOR_PRIMARY_DARKER});
  }
`

export const CommonListContainer = styled.div`
  display: block;
  width: 100%;
  height: 100%;
  overflow: auto;

  ${({ theme }) => theme.colorScrollbar};
`
