import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const GreetingWrapper = styled.div<{ visible$?: boolean }>`
  position: fixed;
  right: 10%;
  max-width: 300px;
  top: ${({ visible$ }) => (visible$ ? '25%' : '50%')};
  opacity: ${({ visible$ }) => (visible$ ? '1' : '0')};
  transition:
    top 0.5s,
    opacity 0.5s;
`

export const GreetingContent = styled.div`
  background: var(${UI.COLOR_PAPER});
  border-radius: 16px;
  padding: 10px;
  margin-top: -9px;
  margin-left: -50px;
  box-shadow: var(${UI.BOX_SHADOW_3});

  > h3,
  > p {
    margin: 0 0 10px 0;
  }
`
export const ActionButton = styled.button<{ secondary?: boolean }>`
  background: var(${({ secondary }) => (secondary ? UI.COLOR_PAPER_DARKER : UI.COLOR_PRIMARY)});
  color: var(${({ secondary }) => (secondary ? UI.COLOR_BUTTON_TEXT_DISABLED : UI.COLOR_BUTTON_TEXT)});
  border: none;
  outline: none;
  font-size: 16px;
  padding: 6px 12px;
  border-radius: 6px;
  margin-right: 6px;
  cursor: pointer;

  &:hover {
    background: var(${({ secondary }) => (secondary ? UI.COLOR_PAPER_DARKEST : UI.COLOR_PRIMARY_LIGHTER)});
  }
`
