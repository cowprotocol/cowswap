import { ReactNode } from 'react'

import { useLingui } from '@lingui/react/macro'

import * as styledEl from './styled'

import { getChartAssetKey } from '../../lib/chartAssets.utils'
import { formatPriceChartValue } from '../../lib/priceSummary.utils'
import { ChartSettingsDropdown } from '../ChartSettingsDropdown'

import type { ChartMetric, ExpansionControl, ChartAsset } from '../../lib/chart.types'

interface PriceChartHeaderProps {
  activeAsset: ChartAsset | undefined
  change?: number
  metric: ChartMetric
  onSelectMetric: (metric: ChartMetric) => void
  onSelectAsset: (asset: ChartAsset) => void
  price?: number
  sizeControl?: ExpansionControl
  assets: ChartAsset[]
}

export function PriceChartHeader({
  activeAsset,
  change,
  metric,
  onSelectMetric,
  onSelectAsset,
  price,
  sizeControl,
  assets,
}: PriceChartHeaderProps): ReactNode {
  const { i18n, t } = useLingui()
  const formattedValue = price === undefined ? undefined : formatPriceChartValue(price, i18n.locale)

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
          {assets.map((asset) => (
            <styledEl.SegmentedControlButton
              $isActive={Boolean(activeAsset && getChartAssetKey(asset) === getChartAssetKey(activeAsset))}
              aria-pressed={Boolean(activeAsset && getChartAssetKey(asset) === getChartAssetKey(activeAsset))}
              key={getChartAssetKey(asset)}
              onClick={() => onSelectAsset(asset)}
              title={`${asset.symbol}/USD`}
              type="button"
            >
              {asset.symbol}
            </styledEl.SegmentedControlButton>
          ))}
        </styledEl.SegmentedControl>
        <ChartSettingsDropdown sizeControl={sizeControl} />
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
