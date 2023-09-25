import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const ButtonSecondary = styled.button<{ padding?: string; minHeight?: string }>`
  background: var(${UI.COLOR_LIGHT_BLUE_OPACITY_90});
  color: var(${UI.COLOR_LIGHT_BLUE});
  font-size: 12px;
  font-weight: 600;
  border: 0;
  box-shadow: none;
  border-radius: 12px;
  position: relative;
  transition: background 0.2s ease-in-out;
  min-height: ${({ minHeight = '35px' }) => minHeight};
  padding: ${({ padding = '0 12px' }) => padding};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: var(${UI.COLOR_LIGHT_BLUE_OPACITY_80});
  }
`
