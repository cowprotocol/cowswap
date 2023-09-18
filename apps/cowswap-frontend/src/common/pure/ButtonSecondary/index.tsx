import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const ButtonSecondary = styled.button`
  background: var(${UI.COLOR_LIGHT_BLUE_OPACITY_90});
  color: var(${UI.COLOR_LIGHT_BLUE});
  font-size: 12px;
  font-weight: 600;
  border: 0;
  box-shadow: none;
  border-radius: 12px;
  position: relative;
  transition: background 0.2s ease-in-out;
  min-height: 35px;
  padding: 0 12px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: var(${UI.COLOR_LIGHT_BLUE_OPACITY_80});
  }
`
