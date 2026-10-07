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
