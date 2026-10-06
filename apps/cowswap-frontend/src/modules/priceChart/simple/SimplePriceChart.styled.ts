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
