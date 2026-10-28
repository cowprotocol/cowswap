import { ContextMenuButton, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { SegmentedControl, SegmentedControlButton } from './PriceChartHeader.styled'

export { SegmentedControlButton }

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

  @media (max-width: 600px) {
    display: contents;
  }
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

export const PeriodMenu = styled.div`
  position: relative;
  flex-shrink: 0;

  [data-reach-menu-items] {
    top: 36px;
    min-width: 80px;
    padding: 4px;
  }
`

export const PeriodMenuButton = styled(ContextMenuButton)`
  width: auto;
  height: 32px;
  gap: 6px;
  padding: 4px 8px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  border-radius: 12px;
  color: var(${UI.COLOR_TEXT});
`
