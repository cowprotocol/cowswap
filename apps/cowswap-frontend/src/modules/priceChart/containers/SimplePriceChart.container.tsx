import { useAtom } from 'jotai'
import { ReactNode, useMemo } from 'react'

import type { Currency } from '@cowprotocol/currency'

import { useLingui } from '@lingui/react/macro'

import { useTheme } from 'common/hooks/useTheme'

import { usePriceChartHistory } from '../hooks/usePriceChartHistory'
import { getPriceChartSummary } from '../lib/priceChart.utils'
import { PriceChartControls } from '../pure/PriceChartControls'
import { PriceChartHeader } from '../pure/PriceChartHeader'
import { PriceChartStatus } from '../pure/PriceChartStatus'
import { SimpleChartCanvas } from '../pure/SimpleChartCanvas'
import * as styledEl from '../pure/SimplePriceChart.styled'
import { priceChartPeriodAtom } from '../state/priceChartPeriodAtom'
import { priceChartTypeAtom } from '../state/priceChartTypeAtom'

import type { Candle, ChartMetric, SupplyVariant, ExpansionControl } from '../lib/priceChart.types'

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
  const { i18n } = useLingui()
  const { primary, text, success, danger } = useTheme()
  const [period, setPeriod] = useAtom(priceChartPeriodAtom)
  const [chartType, setChartType] = useAtom(priceChartTypeAtom)
  const {
    data = EMPTY_CANDLES,
    isPending,
    isError,
  } = usePriceChartHistory(activeCurrency, period, metric, supplyVariant)
  const showStatus = isPending || isError || data.length === 0
  const priceSummary = useMemo(() => getPriceChartSummary(data), [data])

  if (!currencies.length) return <styledEl.EmptyState>Select a token to load the price chart.</styledEl.EmptyState>

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
        <SimpleChartCanvas
          data={data}
          chartType={chartType}
          metric={metric}
          showTooltip={!showStatus}
          locale={i18n.locale}
          colors={{ primary, text, success, danger }}
        />
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
