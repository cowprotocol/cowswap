import type { ReactNode } from 'react'

import { useLingui } from '@lingui/react/macro'
import { LuCandlestickChart, LuTrendingUp } from 'react-icons/lu'

import * as styledEl from './styled'

import { TIME_RANGES } from '../../simple/simplePriceChart.utils'

import type { ChartType, TimeRange } from '../../simple/simplePriceChart.utils'

export interface PriceChartControlsProps {
  chartType: ChartType
  onChartTypeChange: (chartType: ChartType) => void
  onPeriodChange: (period: TimeRange) => void
  period: TimeRange
}

interface ChartTypeControlProps {
  chartType: ChartType
  onChange: (chartType: ChartType) => void
}

export function PriceChartControls({
  chartType,
  onChartTypeChange,
  onPeriodChange,
  period,
}: PriceChartControlsProps): ReactNode {
  return (
    <styledEl.FooterControls>
      <ChartTypeControl chartType={chartType} onChange={onChartTypeChange} />
      <styledEl.Controls aria-label="Price chart period" role="group">
        {TIME_RANGES.map((item) => (
          <styledEl.SegmentedControlButton
            $isActive={item === period}
            aria-pressed={item === period}
            key={item}
            onClick={() => onPeriodChange(item)}
            type="button"
          >
            {item}
          </styledEl.SegmentedControlButton>
        ))}
      </styledEl.Controls>
    </styledEl.FooterControls>
  )
}

function ChartTypeControl({ chartType, onChange }: ChartTypeControlProps): ReactNode {
  const { t } = useLingui()

  return (
    <styledEl.ChartTypeControls aria-label={t`Price chart type`} role="group">
      <styledEl.ChartTypeButton
        $isActive={chartType === 'line'}
        aria-label={t`Area chart`}
        aria-pressed={chartType === 'line'}
        onClick={() => onChange('line')}
        type="button"
      >
        <LuTrendingUp aria-hidden="true" />
      </styledEl.ChartTypeButton>
      <styledEl.ChartTypeButton
        $isActive={chartType === 'candles'}
        aria-label={t`Candlestick chart`}
        aria-pressed={chartType === 'candles'}
        onClick={() => onChange('candles')}
        type="button"
      >
        <LuCandlestickChart aria-hidden="true" />
      </styledEl.ChartTypeButton>
    </styledEl.ChartTypeControls>
  )
}
