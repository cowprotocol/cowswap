import { ReactNode } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

import { useLingui } from '@lingui/react/macro'

import * as styledEl from './styled'

import { formatPriceChartValue } from '../../lib/priceSummary.utils'
import { ChartSettingsDropdown } from '../ChartSettingsDropdown'

import type { ChartMetric, ExpansionControl } from '../../lib/chart.types'

interface PriceChartHeaderProps {
  activeCurrency: Currency | undefined
  change?: number
  metric: ChartMetric
  onSelectMetric: (metric: ChartMetric) => void
  onSelectCurrency: (currency: Currency) => void
  price?: number
  sizeControl?: ExpansionControl
  currencies: Currency[]
}

export function PriceChartHeader({
  activeCurrency,
  change,
  metric,
  onSelectMetric,
  onSelectCurrency,
  price,
  sizeControl,
  currencies,
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
          {currencies.map((currency) => (
            <styledEl.SegmentedControlButton
              $isActive={Boolean(activeCurrency?.equals(currency))}
              aria-pressed={Boolean(activeCurrency?.equals(currency))}
              key={`${currency.chainId}:${getAddressKey(getCurrencyAddress(currency))}`}
              onClick={() => onSelectCurrency(currency)}
              title={`${currency.symbol || 'TOKEN'}/USD`}
              type="button"
            >
              {currency.symbol || 'TOKEN'}
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
