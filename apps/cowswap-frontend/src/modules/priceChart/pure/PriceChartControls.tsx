import type { ReactNode } from 'react'

import { ContextMenu, ContextMenuItem, ContextMenuList } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import { ChevronDown } from 'react-feather'
import { LuCandlestickChart, LuTrendingUp } from 'react-icons/lu'

import * as styledEl from './PriceChartControls.styled'

import { TIME_RANGES } from '../lib/priceChart.constants'

import type { ChartType, TimeRange } from '../lib/priceChart.types'

export interface PriceChartControlsProps {
  compact?: boolean
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
  compact = false,
  chartType,
  onChartTypeChange,
  onPeriodChange,
  period,
}: PriceChartControlsProps): ReactNode {
  const { t } = useLingui()

  return (
    <styledEl.FooterControls>
      <ChartTypeControl chartType={chartType} onChange={onChartTypeChange} />
      {compact ? (
        <styledEl.PeriodMenu>
          <ContextMenu>
            <styledEl.PeriodMenuButton aria-label={t`Price chart period: ${period}`}>
              {period}
              <ChevronDown size={16} aria-hidden="true" />
            </styledEl.PeriodMenuButton>
            <ContextMenuList>
              {TIME_RANGES.map((item) => (
                <ContextMenuItem key={item} onSelect={() => onPeriodChange(item)}>
                  {item}
                </ContextMenuItem>
              ))}
            </ContextMenuList>
          </ContextMenu>
        </styledEl.PeriodMenu>
      ) : (
        <styledEl.Controls aria-label={t`Price chart period`} role="group">
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
      )}
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
