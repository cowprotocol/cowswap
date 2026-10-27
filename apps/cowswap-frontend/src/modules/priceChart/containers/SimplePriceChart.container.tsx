import { useAtom } from 'jotai'
import { ReactNode, useMemo } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import type { Currency } from '@cowprotocol/currency'

import { useLingui } from '@lingui/react/macro'

import { usePriceChartHistory } from '../hooks/usePriceChartHistory'
import { getPriceChartSummary } from '../lib/priceChart.utils'
import { PriceChartControls } from '../pure/PriceChartControls'
import { PriceChartHeader } from '../pure/PriceChartHeader'
import { PriceChartStatus } from '../pure/PriceChartStatus'
import { SimpleChartCanvas } from '../pure/SimpleChartCanvas'
import * as styledEl from '../pure/SimplePriceChart.styled'
import { priceChartPeriodAtom } from '../state/priceChartPeriodAtom'
import { priceChartTypeAtom } from '../state/priceChartTypeAtom'

import type {
  Candle,
  ChartMetric,
  ExpansionControl,
  SupplyVariant,
  PriceChartReferenceLine,
  PriceChartExecutionMarker,
} from '../lib/priceChart.types'

export interface SimplePriceChartProps {
  activeCurrency: Currency | undefined
  currencies: Currency[]
  metric: ChartMetric
  onSelectMetric: (metric: ChartMetric) => void
  onSelectCurrency: (currency: Currency) => void
  onClose?: () => void
  sizeControl?: ExpansionControl
  supplyVariant: SupplyVariant
  onSelectPrice?: (price: number) => void
  referenceLines: PriceChartReferenceLine<number>[]
  executionMarkers: PriceChartExecutionMarker[]
}

const EMPTY_CANDLES: Candle[] = []

export function SimplePriceChart({
  activeCurrency,
  metric,
  onSelectMetric,
  onSelectCurrency,
  onClose,
  sizeControl,
  currencies,
  supplyVariant,
  onSelectPrice,
  referenceLines,
  executionMarkers,
}: SimplePriceChartProps): ReactNode {
  const { i18n } = useLingui()
  const isMobile = useMediaQuery('(max-width: 600px)')
  const [period, setPeriod] = useAtom(priceChartPeriodAtom)
  const [chartType, setChartType] = useAtom(priceChartTypeAtom)
  const {
    data = EMPTY_CANDLES,
    isPending,
    isError,
  } = usePriceChartHistory(activeCurrency, period, metric, supplyVariant)
  const showStatus = isPending || isError || data.length === 0
  const priceSummary = useMemo(() => getPriceChartSummary(data), [data])

  const controls = (
    <PriceChartControls
      compact={isMobile}
      chartType={chartType}
      onChartTypeChange={setChartType}
      onPeriodChange={setPeriod}
      period={period}
    />
  )

  return (
    <styledEl.PanelWrapper>
      <PriceChartHeader
        activeCurrency={activeCurrency}
        change={priceSummary?.change}
        metric={metric}
        onSelectMetric={onSelectMetric}
        onSelectCurrency={onSelectCurrency}
        onClose={onClose}
        price={priceSummary?.price}
        sizeControl={sizeControl}
        currencies={currencies}
        controls={isMobile ? controls : undefined}
      />
      <styledEl.ChartFrame>
        <SimpleChartCanvas
          data={data}
          executionMarkers={executionMarkers}
          onSelectPrice={showStatus ? undefined : onSelectPrice}
          referenceLines={referenceLines}
          chartType={chartType}
          metric={metric}
          showTooltip={!showStatus}
          locale={i18n.locale}
        />
        {showStatus ? (
          <styledEl.OverlayState>
            <PriceChartStatus assetSymbol={activeCurrency?.symbol} isPending={isPending} isError={isError} />
          </styledEl.OverlayState>
        ) : null}
      </styledEl.ChartFrame>
      {!isMobile && controls}
    </styledEl.PanelWrapper>
  )
}
