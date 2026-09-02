import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.button<{ isBetter: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 4px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: ${({ isBetter }) => (isBetter ? `var(${UI.COLOR_SUCCESS_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 0.8;
  }
`

export const SwitchLabel = styled.span`
  text-decoration: underline;
  text-underline-offset: 2px;
`
