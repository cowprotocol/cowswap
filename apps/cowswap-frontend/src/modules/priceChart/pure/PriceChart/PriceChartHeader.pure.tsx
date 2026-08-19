import { ReactNode } from 'react'

import { NewTooltip } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import { Maximize2, Minimize2 } from 'react-feather'

import * as styledEl from './PriceChart.styled'

import { formatUsdMarketCap, formatUsdPrice } from '../../lib/priceSummary.utils'

import type { PriceChartMetric } from '../../lib/priceChart.types'
import type {
  PriceChartSelection,
  PriceChartSizeControl,
  PriceChartSymbolDescriptor,
} from '../../lib/tradingView.types'

interface PriceChartHeaderProps {
  activeSymbol: PriceChartSymbolDescriptor | undefined
  change?: number
  metric: PriceChartMetric
  onSelectMetric: (metric: PriceChartMetric) => void
  onSelectSelection: (selection: PriceChartSelection) => void
  price?: number
  sizeControl?: PriceChartSizeControl
  symbols: PriceChartSymbolDescriptor[]
}

export function PriceChartHeader({
  activeSymbol,
  change,
  metric,
  onSelectMetric,
  onSelectSelection,
  price,
  sizeControl,
  symbols,
}: PriceChartHeaderProps): ReactNode {
  const { i18n, t } = useLingui()
  const sizeLabel = sizeControl?.isExpanded ? t`Minimize price chart` : t`Maximize price chart`
  const SizeIcon = sizeControl?.isExpanded ? Minimize2 : Maximize2
  const formattedValue =
    price === undefined
      ? undefined
      : metric === 'marketCap'
        ? formatUsdMarketCap(price, i18n.locale)
        : formatUsdPrice(price, i18n.locale)

  return (
    <styledEl.Header>
      <styledEl.Heading>
        <styledEl.MetricControl aria-label={t`Chart metric`} role="group">
          <styledEl.MetricButton
            $isActive={metric === 'price'}
            aria-pressed={metric === 'price'}
            onClick={() => onSelectMetric('price')}
            type="button"
          >
            {t`Price`}
          </styledEl.MetricButton>
          <styledEl.MetricButton
            $isActive={metric === 'marketCap'}
            aria-pressed={metric === 'marketCap'}
            onClick={() => onSelectMetric('marketCap')}
            type="button"
          >
            {t`Market Cap`}
          </styledEl.MetricButton>
        </styledEl.MetricControl>
        <styledEl.PriceSummary>
          {formattedValue !== undefined && change !== undefined ? (
            <>
              <styledEl.CurrentPrice>{formattedValue}</styledEl.CurrentPrice>
              <styledEl.PriceChange $isPositive={change >= 0}>
                {formatPercentageChange(change, i18n.locale)}
              </styledEl.PriceChange>
            </>
          ) : null}
        </styledEl.PriceSummary>
      </styledEl.Heading>
      <styledEl.HeaderControls>
        <styledEl.SegmentedControl aria-label="Price chart asset" role="group">
          {symbols.map((symbol) => (
            <styledEl.SegmentedControlButton
              $isActive={symbol.selection === activeSymbol?.selection}
              aria-pressed={symbol.selection === activeSymbol?.selection}
              key={symbol.ticker}
              onClick={() => onSelectSelection(symbol.selection)}
              title={`${symbol.baseAsset.symbol}/USD`}
              type="button"
            >
              {symbol.baseAsset.symbol}
            </styledEl.SegmentedControlButton>
          ))}
        </styledEl.SegmentedControl>
        {sizeControl ? (
          <NewTooltip content={sizeLabel} placement="top">
            <styledEl.SizeButton
              aria-label={sizeLabel}
              aria-pressed={sizeControl.isExpanded}
              onClick={sizeControl.onToggle}
              type="button"
            >
              <SizeIcon aria-hidden="true" />
            </styledEl.SizeButton>
          </NewTooltip>
        ) : null}
      </styledEl.HeaderControls>
    </styledEl.Header>
  )
}

function formatPercentageChange(change: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    signDisplay: 'always',
    style: 'percent',
  }).format(change)
}
