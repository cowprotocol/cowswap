import { LoadingChart } from '../Chart/LoadingChart'
import { ChartContainer } from '../Chart/LoadingChart'
import { Chart, TimePeriod } from '../Chart'
import { ParentSize } from '@visx/responsive'
import { useMemo } from 'react'
import { useQuery, OperationVariables } from '@apollo/client'
import { tokenPriceQuery, HistoryDuration, Chain } from 'services/uniswap-price/queries'
import { usePriceHistory } from 'lib/hooks/usePriceHistory'
import { fixChart } from 'util/fixChart'
import { Platforms } from 'types'

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
