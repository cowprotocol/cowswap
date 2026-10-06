import { ReactNode, useMemo, useState } from 'react'

import type { Currency } from '@cowprotocol/currency'

import { ChartCanvas } from './ChartCanvas'
import * as styledEl from './SimplePriceChart.styled'

import { usePriceChartHistory } from '../hooks/usePriceChartHistory'
import { getPriceChartSummary } from '../lib/priceSummary.utils'
import { PriceChartControls } from '../pure/PriceChartControls'
import { PriceChartHeader } from '../pure/PriceChartHeader'
import { PriceChartStatus } from '../pure/PriceChartStatus'

import type { ChartType, TimeRange } from './simplePriceChart.utils'
import type { Candle, ChartMetric, SupplyVariant, ExpansionControl } from '../lib/chart.types'

export interface SimplePriceChartProps {
  activeCurrency: Currency | undefined
  currencies: Currency[]
  metric: ChartMetric
  onSelectMetric: (metric: ChartMetric) => void
  onSelectCurrency: (currency: Currency) => void
  sizeControl?: ExpansionControl
  supplyVariant: SupplyVariant
}

const EMPTY_CANDLES: Candle[] = []

export function SimplePriceChart({
  activeCurrency,
  metric,
  onSelectMetric,
  onSelectCurrency,
  sizeControl,
  currencies,
  supplyVariant,
}: SimplePriceChartProps): ReactNode {
  const [period, setPeriod] = useState<TimeRange>('1D')
  const [chartType, setChartType] = useState<ChartType>('line')
  const {
    data = EMPTY_CANDLES,
    isPending,
    isError,
  } = usePriceChartHistory(activeCurrency, period, metric, supplyVariant)
  const showStatus = isPending || isError || data.length === 0
  const priceSummary = useMemo(() => getPriceChartSummary(data), [data])

  if (!currencies.length) return <styledEl.EmptyState>Select both tokens to load the price chart.</styledEl.EmptyState>

  return (
    <styledEl.PanelWrapper>
      <PriceChartHeader
        activeCurrency={activeCurrency}
        change={priceSummary?.change}
        metric={metric}
        onSelectMetric={onSelectMetric}
        onSelectCurrency={onSelectCurrency}
        price={priceSummary?.price}
        sizeControl={sizeControl}
        currencies={currencies}
      />
      <styledEl.ChartFrame>
        <ChartCanvas data={data} chartType={chartType} metric={metric} showTooltip={!showStatus} />
        {showStatus ? (
          <styledEl.OverlayState>
            <PriceChartStatus assetSymbol={activeCurrency?.symbol} isPending={isPending} isError={isError} />
          </styledEl.OverlayState>
        ) : null}
      </styledEl.ChartFrame>
      <PriceChartControls
        chartType={chartType}
        onChartTypeChange={setChartType}
        onPeriodChange={setPeriod}
        period={period}
      />
    </styledEl.PanelWrapper>
  )
}
