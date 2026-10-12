import { UI, font } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Canvas = styled.div<{ $canSelectPrice: boolean }>`
  width: 100%;
  height: 100%;
  min-height: 0;
  cursor: ${({ $canSelectPrice }) => ($canSelectPrice ? 'crosshair' : 'default')};
`

export const SelectionHint = styled.div`
  position: absolute;
  top: 8px;
  left: 50%;
  z-index: 2;
  transform: translateX(-50%);
  padding: 6px 10px;
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 999px;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  ${font('FONT_SMALL', 'medium')}
  white-space: nowrap;
  pointer-events: none;
`
