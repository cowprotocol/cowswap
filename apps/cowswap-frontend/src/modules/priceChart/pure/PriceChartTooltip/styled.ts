import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Tooltip = styled.div<{ $placement: 'left' | 'right'; $width: number; $x: number; $y: number }>`
  position: absolute;
  left: ${({ $x }) => `${$x}px`};
  top: ${({ $y }) => `${$y}px`};
  transform: ${({ $placement }) => ($placement === 'left' ? 'translate(-100%, -50%)' : 'translateY(-50%)')};
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: ${({ $width }) => `${$width}px`};
  padding: 12px 14px;
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 14px;
  background: var(${UI.COLOR_PAPER});
  box-shadow: 0 8px 24px rgb(0 0 0 / 14%);
  color: var(${UI.COLOR_TEXT});
  font-size: 14px;
  font-family: var(${UI.FONT_FAMILY_PRIMARY});
  line-height: 1.2;
  pointer-events: none;
`

export const TooltipRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`

export const TooltipLabel = styled.span`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const TooltipValue = styled.span`
  color: var(${UI.COLOR_TEXT});
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`

export const TooltipTime = styled.time`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  white-space: nowrap;
`
