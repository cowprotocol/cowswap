import styled from 'styled-components/macro'

import { PanelWrapper as SimplePanelWrapper } from './SimplePriceChart.styled'

export const PanelWrapper = styled(SimplePanelWrapper)`
  grid-template-rows: auto minmax(0, 1fr);
`

export const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
`
