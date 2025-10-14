import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div<{ $enabled: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 20px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid ${({ $enabled }) => ($enabled ? `transparent` : `var(${UI.COLOR_BORDER})`)};
  background-color: ${({ $enabled }) => ($enabled ? `var(${UI.COLOR_PAPER_DARKER})` : 'transparent')};
`

export const SettingsButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: var(${UI.COLOR_TEXT});
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  outline: none;

  > svg {
    color: inherit;
    stroke: currentColor;
  }
`
