import { useAtomValue } from 'jotai'
import { ReactNode, useEffect, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { useLingui } from '@lingui/react/macro'

import { getPriceChartSummary } from '../lib/priceChart.utils'
import { createPriceChartDatafeed } from '../lib/priceChartAdvancedDatafeed.service'
import { createChartSymbols } from '../lib/priceChartAdvancedSymbols.utils'
import { AdvancedChartCanvas } from '../pure/AdvancedChartCanvas'
import { PanelWrapper } from '../pure/AdvancedChartCanvas.styled'
import { PriceChartHeader } from '../pure/PriceChartHeader'
import { PriceChartStatus } from '../pure/PriceChartStatus'
import * as styledEl from '../pure/SimplePriceChart.styled'
import { priceChartAutoRefreshAtom } from '../state/priceChartAutoRefreshAtom'

import type { SimplePriceChartProps } from './SimplePriceChart.container'

export function AdvancedPriceChart({
  activeCurrency,
  metric,
  onSelectMetric,
  onSelectCurrency,
  onClose,
  sizeControl,
  currencies,
  supplyVariant,
}: SimplePriceChartProps): ReactNode {
  const autoRefresh = useAtomValue(priceChartAutoRefreshAtom)
  const symbols = useMemo(() => createChartSymbols(currencies), [currencies])
  const queryClient = useQueryClient()
  const activeSymbol = symbols.find(
    (symbol) =>
      activeCurrency?.equals(symbol.currency) &&
      symbol.metric === metric &&
      (metric === 'price' || symbol.supplyVariant === supplyVariant),
  )
  const { i18n } = useLingui()
  const [widgetError, setWidgetError] = useState(false)
  const [priceSummary, setPriceSummary] = useState<ReturnType<typeof getPriceChartSummary>>()
  const [hasVolume, setHasVolume] = useState<boolean>()
  const activeTicker = activeSymbol?.ticker || ''
  const datafeedController = useMemo(
    () =>
      createPriceChartDatafeed({
        queryClient,
        onHistoryLoaded: (bars) => {
          setPriceSummary(getPriceChartSummary(bars))
          setHasVolume(bars.some((bar) => bar.volume !== undefined))
        },
        symbols,
      }),
    [queryClient, symbols],
  )

  useEffect(() => {
    datafeedController.setAutoRefreshEnabled(autoRefresh)
  }, [autoRefresh, datafeedController])

  useEffect(() => {
    return () => {
      datafeedController.dispose()
    }
  }, [datafeedController])

  useEffect(() => {
    setPriceSummary(undefined)
    setHasVolume(undefined)
    datafeedController.setActiveTicker(activeTicker)
  }, [activeTicker, datafeedController])

  return (
    <PanelWrapper>
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
      />
      <styledEl.ChartFrame>
        <AdvancedChartCanvas
          activeTicker={activeTicker}
          datafeed={datafeedController.datafeed}
          hasVolume={hasVolume}
          symbols={symbols}
          locale={i18n.locale}
          onError={setWidgetError}
        />
        {widgetError ? (
          <styledEl.OverlayState>
            <PriceChartStatus assetSymbol={activeCurrency?.symbol} isPending={false} isError />
          </styledEl.OverlayState>
        ) : null}
      </styledEl.ChartFrame>
    </PanelWrapper>
  )
}
