import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ButtonSecondary = styled.button<{
  padding?: string
  minHeight?: string
  margin?: string
  variant?: string
}>`
  background: ${({ variant }) => (variant === 'light' ? `var(${UI.COLOR_PAPER_DARKER})` : `var(${UI.COLOR_PRIMARY})`)};
  color: ${({ variant }) => (variant === 'light' ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_BUTTON_TEXT})`)};
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
  margin: ${({ margin = '0' }) => margin};

  &:hover {
    background: var(${UI.COLOR_PRIMARY_LIGHTER});
    color: var(${UI.COLOR_BUTTON_TEXT});
  }
`
