import styled from 'styled-components/macro'

import { UI } from '../../enum'

export const ButtonSecondaryAlt = styled.button<{ padding?: string; minHeight?: string }>`
  background: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_BUTTON_TEXT});
  font-size: 12px;
  font-weight: 600;
  border: 0;
  box-shadow: none;
  border-radius: 12px;
  position: relative;
  transition: background var(${UI.ANIMATION_DURATION}) ease-in-out;
  min-height: ${({ minHeight = '35px' }) => minHeight};
  padding: ${({ padding = '0 12px' }) => padding};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: var(${UI.COLOR_PRIMARY_LIGHTER});
  }
`
