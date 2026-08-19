import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { SegmentedControl, SegmentedControlButton } from './PriceChart.styled'

export const ChartFrame = styled.div`
  position: relative;
  min-height: 0;
  overflow: hidden;
  border-radius: 12px;
  background: transparent;
  margin-left: -10px;
  margin-right: -10px;
`

export const ChartCanvas = styled.div<{ $canSelectPrice: boolean }>`
  width: 100%;
  height: 100%;
  min-height: 0;
  cursor: ${({ $canSelectPrice }) => ($canSelectPrice ? 'crosshair' : 'default')};
`

export const Controls = styled(SegmentedControl)`
  padding: 2px;
  max-width: 100%;

  > ${SegmentedControlButton} {
    padding-block: 6px;
  }
`

export const FooterControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  flex-wrap: wrap;
`

export const ChartTypeControls = styled(SegmentedControl)`
  padding: 2px;
  flex-shrink: 0;
`

export const ChartTypeButton = styled(SegmentedControlButton)`
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 4px;

  > svg {
    width: 18px;
    height: 18px;
  }
`

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
  font-family: var(${UI.FONT_FAMILY_MONO});
  line-height: 1.2;
  pointer-events: none;
`

export const TooltipRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
`

export const TooltipLabel = styled.span`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const TooltipValue = styled.span`
  color: var(${UI.COLOR_TEXT});
  font-size: 16px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  text-align: right;
`

export const TooltipTime = styled.time`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  white-space: nowrap;
`
