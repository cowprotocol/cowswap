import React from 'react'

import styled from 'styled-components/macro'

import { SummaryCards } from './SummaryCards'
import { useGetSummaryData } from './useGetSummaryData'
import { VolumeChartWidget } from './VolumeChart/VolumeChartWidget'

export function StatsSummaryCardsWidget(): React.ReactNode {
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
