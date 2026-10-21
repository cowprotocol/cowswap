import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Header = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;

  @media (max-width: 600px) {
    grid-template-columns: minmax(0, 1fr) auto;

    .chart-settings {
      position: static;
    }

    .chart-settings [data-reach-menu-list] {
      min-width: 0;
      width: 100%;
      max-width: 20.125rem;
    }
  }
`

export const Heading = styled.div`
  grid-column: 1;
  grid-row: 1;
  min-width: 0;
  display: grid;
  grid-template-rows: 24px 24px;
  align-items: flex-start;
  gap: 6px;
  text-align: left;
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

export const Toolbar = styled.div`
  grid-column: 2;
  grid-row: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  @media (max-width: 600px) {
    grid-column: 1 / -1;
    grid-row: 2;
    flex-wrap: wrap;
  }
`

export const HeaderControls = styled.div`
  grid-column: 3;
  grid-row: 1;
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 8px;

  @media (max-width: 600px) {
    grid-column: 2;
    align-self: start;
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
  min-width: 0;
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 999px;
  background: var(${UI.COLOR_PAPER_DARKER});

  max-width: 100%;
`

export const SegmentedControlButton = styled.button<{ $isActive: boolean }>`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 0;
  background: ${({ $isActive }) => ($isActive ? `var(${UI.COLOR_PAPER})` : 'transparent')};
  color: ${({ $isActive }) => ($isActive ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
  border-radius: 999px;
  height: 26px;
  padding: 6px 14px;
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
