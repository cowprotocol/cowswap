import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  margin: 3px 0 3px 3px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px 3px 3px 999px;
  background: var(${UI.COLOR_SUCCESS_BG});
  color: var(${UI.COLOR_SUCCESS_TEXT});
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  transition:
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    background: var(${UI.COLOR_SUCCESS_TEXT});
    color: var(${UI.COLOR_PAPER});
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  ${Media.upToMedium()} {
    padding: 0 12px;
  }
`

export const Icon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
`

export const Label = styled.span`
  ${Media.upToMedium()} {
    display: none;
  }
`
