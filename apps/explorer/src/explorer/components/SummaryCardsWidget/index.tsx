import React from 'react'
import styled from 'styled-components'

import { SummaryCards } from './SummaryCards'
import { useGetSummaryData } from './useGetSummaryData'
import { VolumeChartWidget } from './VolumeChart/VolumeChartWidget'

export function StatsSummaryCardsWidget(): JSX.Element {
  const summaryData = useGetSummaryData()

  return (
    <Wrapper>
      <SummaryCards summaryData={summaryData}>
        <VolumeChartWidget />
      </SummaryCards>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
`
