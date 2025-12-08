import { useMemo } from 'react'

import { useQuery } from '@apollo/client'
import { ParentSize } from '@visx/responsive'
import { tokenPriceQuery, HistoryDuration, Chain } from 'services/uniswap-price/queries'
import { Platforms } from 'types'

import { fixChart } from 'util/fixChart'

import { usePriceHistory } from 'lib/hooks/usePriceHistory'

import { Chart, TimePeriod } from '../Chart'
import { ChartContainer } from '../Chart/LoadingChart'
import { LoadingChart } from '../Chart/LoadingChart'

type ChartSectionProps = {
  platforms: Platforms
}

type QueryVars = {
  duration: HistoryDuration
  chain: Chain
  address: string
}

export function ChartSection({ platforms }: ChartSectionProps) {
  const queryVariables = useMemo<QueryVars | undefined>(() => {
    if (!platforms.ethereum.contractAddress) {
      return undefined
    }

    return {
      duration: HistoryDuration.Day,
      chain: Chain.Ethereum,
      address: platforms.ethereum.contractAddress,
    }
  }, [platforms.ethereum.contractAddress])

  const { data, loading } = useQuery(tokenPriceQuery, {
    variables: queryVariables,
    skip: !queryVariables,
  })

  const originalPrices = usePriceHistory(data)

  const { prices } = useMemo(
    () => (originalPrices && originalPrices.length > 0 ? fixChart(originalPrices) : { prices: null, blanks: [] }),
    [originalPrices],
  )

  if (loading || !prices) {
    return <LoadingChart />
  }

  return (
    <ChartContainer>
      <ParentSize>
        {({ width }: { width: number }) => (
          <Chart prices={prices} timePeriod={TimePeriod.DAY} width={width} height={350} />
        )}
      </ParentSize>
    </ChartContainer>
  )
}
