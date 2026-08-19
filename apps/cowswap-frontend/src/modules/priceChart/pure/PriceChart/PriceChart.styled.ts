import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const PanelWrapper = styled.div`
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 12px;
  height: 100%;
  width: 100%;
  min-width: 0;
`

export const Header = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

export const Heading = styled.div`
  grid-column: 1;
  display: grid;
  grid-template-rows: 24px 24px;
  align-items: flex-start;
  gap: 6px;
  text-align: left;

  @media (max-width: 600px) {
    grid-column: 1;
  }
`

export const MetricControl = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  height: 24px;
`

export const MetricButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  min-height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ $isActive }) => `var(${$isActive ? UI.COLOR_TEXT : UI.COLOR_TEXT_OPACITY_50})`};
  font-size: 12px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  line-height: 1;
  cursor: pointer;

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 4px;
  }
`

export const HeaderControls = styled.div`
  grid-column: 2;
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 8px;

  @media (max-width: 600px) {
    grid-column: 1;
    grid-row: 2;
    justify-self: center;
  }
`

export const PriceSummary = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  min-height: 24px;
`

export const CurrentPrice = styled.span`
  color: var(${UI.COLOR_TEXT});
  font-size: 24px;
  font-weight: var(${UI.FONT_WEIGHT_NORMAL});
  line-height: 1;
`

export const PriceChange = styled.span<{ $isPositive: boolean }>`
  margin: 0;
  color: ${({ $isPositive }) => `var(${$isPositive ? UI.COLOR_SUCCESS : UI.COLOR_DANGER})`};
  font-size: 14px;
  line-height: 1;
`

export const SegmentedControl = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 999px;
  background: var(${UI.COLOR_PAPER_DARKER});
`

export const SizeButton = styled.button`
  display: grid;
  place-items: center;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(${UI.COLOR_PAPER_DARKER});
  color: var(${UI.COLOR_TEXT});
  cursor: pointer;

  > svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: var(${UI.COLOR_PRIMARY});
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
  }
`

export const SegmentedControlButton = styled.button<{ $isActive: boolean }>`
  border: 0;
  background: ${({ $isActive }) => ($isActive ? `var(${UI.COLOR_PAPER})` : 'transparent')};
  color: ${({ $isActive }) => ($isActive ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  line-height: 1;
  cursor: pointer;
  transition:
    color 120ms ease,
    background 120ms ease,
    box-shadow 120ms ease;

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
  }
`

export const ChartFrame = styled.div`
  position: relative;
  display: flex;
  min-height: 0;
  border-radius: 12px;
  overflow: hidden;
  background: transparent;
  margin-left: -10px;
  margin-right: -10px;
`

export const ChartContainer = styled.div`
  flex: 1;
  height: 100%;
  min-height: 0;
  width: 100%;
`

export const OverlayState = styled.div`
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  place-items: center;
  padding: 24px;
  text-align: center;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  font-size: 14px;
  line-height: 1.5;
  pointer-events: auto;
`

export const EmptyState = styled.div`
  display: grid;
  place-items: center;
  min-height: 320px;
  padding: 24px;
  text-align: center;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 14px;
  line-height: 1.5;
`
