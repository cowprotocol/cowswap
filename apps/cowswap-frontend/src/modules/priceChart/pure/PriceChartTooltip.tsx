import type { ReactNode } from 'react'

import { formatDateTime } from '@cowprotocol/common-utils'

import { useLingui } from '@lingui/react/macro'

import * as styledEl from './PriceChartTooltip.styled'

import { formatPriceChartValue } from '../lib/priceChart.utils'

import type { Candle, ChartMetric } from '../lib/priceChart.types'

const TOOLTIP_HEIGHT = 88
const TOOLTIP_ROW_HEIGHT = 27
const TOOLTIP_OFFSET = 12
const TOOLTIP_WIDTH = 280

export interface ChartTooltipData {
  price: number
  ohlc?: Pick<Candle, 'open' | 'high' | 'low' | 'close'>
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
  const width = Math.min(TOOLTIP_WIDTH, data.chartWidth)
  const placeOnLeft = data.x + TOOLTIP_OFFSET + width > data.chartWidth
  const rows = data.ohlc
    ? [
        { label: t`Open`, value: data.ohlc.open },
        { label: t`High`, value: data.ohlc.high },
        { label: t`Low`, value: data.ohlc.low },
        { label: t`Close`, value: data.ohlc.close },
      ]
    : [{ label: metric === 'marketCap' ? t`Market Cap` : t`Price`, value: data.price }]
  const halfHeight = (TOOLTIP_HEIGHT + (rows.length - 1 + Number(data.volume !== undefined)) * TOOLTIP_ROW_HEIGHT) / 2
  const x = Math.max(
    0,
    Math.min(data.x + (placeOnLeft ? -TOOLTIP_OFFSET - width : TOOLTIP_OFFSET), data.chartWidth - width),
  )
  const y = Math.max(halfHeight, Math.min(data.y, data.chartHeight - halfHeight))

  return (
    <styledEl.Tooltip $width={width} $x={x} $y={y} role="tooltip">
      {rows.map(({ label, value }) => (
        <styledEl.TooltipRow key={label}>
          <styledEl.TooltipLabel>{label}</styledEl.TooltipLabel>
          <styledEl.TooltipValue>{formatPriceChartValue(value, locale)}</styledEl.TooltipValue>
        </styledEl.TooltipRow>
      ))}
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
