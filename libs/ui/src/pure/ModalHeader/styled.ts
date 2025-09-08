import styled, { css } from 'styled-components/macro'

import { UI } from '../../enum'

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

export const Header = styled.div<{ withoutBorder?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-weight: 500;
  padding: 16px;
  align-items: center;
  font-size: 17px;
  border-bottom: ${({ withoutBorder }) => (withoutBorder ? 'none' : `1px solid var(${UI.COLOR_BORDER})`)};

  > div {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

export const Title = styled.div<{ hasClose?: boolean }>`
  width: ${({ hasClose }) => (hasClose ? 'auto' : '100%')};
`
