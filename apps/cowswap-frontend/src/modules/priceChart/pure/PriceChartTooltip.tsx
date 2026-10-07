import type { ReactNode } from 'react'

import { formatDateTime } from '@cowprotocol/common-utils'

import { useLingui } from '@lingui/react/macro'

import * as styledEl from './PriceChartTooltip.styled'

import { formatPriceChartValue } from '../lib/priceChart.utils'

import type { ChartMetric } from '../lib/priceChart.types'

const TOOLTIP_HEIGHT = 88
const TOOLTIP_HEIGHT_WITH_VOLUME = 115
const TOOLTIP_OFFSET = 12
const TOOLTIP_WIDTH = 280

export interface ChartTooltipData {
  price: number
  time: number
  volume?: number
  x: number
  y: number
  chartWidth: number
  chartHeight: number
}

export interface PriceChartTooltipProps {
  data: ChartTooltipData
  metric: ChartMetric
  locale: string
}

export function PriceChartTooltip({ data, metric, locale }: PriceChartTooltipProps): ReactNode {
  const { t } = useLingui()
  const placeOnLeft = data.x + TOOLTIP_OFFSET + TOOLTIP_WIDTH > data.chartWidth
  const halfHeight = (data.volume === undefined ? TOOLTIP_HEIGHT : TOOLTIP_HEIGHT_WITH_VOLUME) / 2
  const x = data.x + (placeOnLeft ? -TOOLTIP_OFFSET : TOOLTIP_OFFSET)
  const y = Math.max(halfHeight, Math.min(data.y, data.chartHeight - halfHeight))

  return (
    <styledEl.Tooltip $placement={placeOnLeft ? 'left' : 'right'} $width={TOOLTIP_WIDTH} $x={x} $y={y} role="tooltip">
      <styledEl.TooltipRow>
        <styledEl.TooltipLabel>{metric === 'marketCap' ? t`Market Cap` : t`Price`}</styledEl.TooltipLabel>
        <styledEl.TooltipValue>{formatPriceChartValue(data.price, locale)}</styledEl.TooltipValue>
      </styledEl.TooltipRow>
      {data.volume === undefined ? null : (
        <styledEl.TooltipRow>
          <styledEl.TooltipLabel>{t`Volume`}</styledEl.TooltipLabel>
          <styledEl.TooltipValue>{formatPriceChartValue(data.volume, locale)}</styledEl.TooltipValue>
        </styledEl.TooltipRow>
      )}
      <styledEl.TooltipTime>{formatDateTime(data.time * 1000, locale)}</styledEl.TooltipTime>
    </styledEl.Tooltip>
  )
}
