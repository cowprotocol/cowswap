import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ToggleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  border-radius: 12px;
  background: var(${UI.COLOR_BACKGROUND});
  color: var(${UI.COLOR_TEXT_PAPER});
`

export const OptionWrapper = styled.button<{ isActive?: boolean }>`
  border: none;
  border-radius: 9px;
  margin: 4px;
  flex: 1;
  line-height: 1;
  fornt-size: 12px;
  cursor: ${({ isActive }) => (isActive ? 'default' : 'pointer')};
  color: ${({ isActive }) => (isActive ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
  background: ${({ isActive }) => (isActive ? `var(${UI.COLOR_PAPER})` : 'transparent')};
`

export const PartialAmountWrapper = styled.div<{ isActive?: boolean }>`
  display: inline-block;
  border-radius: 140px;
  font-size: 12px;
  padding: 1px 6px;
  cursor: ${({ isActive }) => (isActive ? 'default' : 'pointer')};
  background: var(${UI.COLOR_INFO_BG});
`

export const OptionTitle = styled.div`
  fornt-size: 14px;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: inherit;
`
