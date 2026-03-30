import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const PanelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 620px;
  height: 100%;
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
`

export const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 10px;
`

export const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
`

export const LatestPrice = styled.p`
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 13px;
  line-height: 1.4;
`

export const SymbolList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const SymbolButton = styled.button<{ $isActive: boolean }>`
  border: 1px solid ${({ $isActive }) => ($isActive ? `var(${UI.COLOR_PRIMARY})` : `var(${UI.COLOR_BORDER})`)};
  background: ${({ $isActive }) =>
    $isActive ? `var(${UI.COLOR_PRIMARY_OPACITY_25})` : `var(${UI.COLOR_PAPER_DARKER})`};
  color: inherit;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition:
    border-color 120ms ease,
    background 120ms ease;

  &:hover {
    border-color: var(${UI.COLOR_PRIMARY});
  }
`

export const ChartFrame = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  min-height: 520px;
  border-radius: 12px;
  overflow: hidden;
  background: var(${UI.COLOR_PAPER_DARKER});
`

export const ChartContainer = styled.div`
  flex: 1;
  height: 100%;
  min-height: 520px;
  width: 100%;
`

export const OverlayState = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  text-align: center;
  background: transparent;
  color: var(${UI.COLOR_TEXT});
  font-size: 14px;
  line-height: 1.5;
  pointer-events: none;
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
