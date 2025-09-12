import { Color, UI } from '@cowprotocol/ui'

import { transparentize } from 'polished'
import styled from 'styled-components/macro'

export const ToggleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  border-radius: 12px;
  background: var(${UI.COLOR_PAPER_DARKER});
`

export const OptionWrapper = styled.button<{ isActive?: boolean }>`
  border: none;
  border-radius: 9px;
  margin: 4px;
  flex: 1;
  fornt-size: 12px;
  cursor: ${({ isActive }) => (isActive ? 'default' : 'pointer')};
  background: ${({ isActive }) => (isActive ? `var(${UI.COLOR_PAPER})` : 'transparent')};
  color: ${({ isActive }) => (isActive ? Color.cowfi_darkBlue : transparentize(0.5, Color.cowfi_darkBlue))};
`

export const PartialApproveWrapper = styled.div<{ isActive?: boolean }>`
  display: inline-block;
  border-radius: 140px;
  font-size: 12px;
  padding: 0 6px;
  cursor: ${({ isActive }) => (isActive ? 'default' : 'pointer')};
  // todo
  background: rgba(13, 94, 217, 0.1);
`

export const OptionTitle = styled.div`
  fornt-size: 14px;
  font-weight: 600;
  margin: 0 0 5px 0;
`
