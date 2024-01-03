import React, { useEffect, useRef, useState } from 'react'
import { DefaultTheme, useTheme } from 'styled-components'
import { format, fromUnixTime } from 'date-fns'
import {
  createChart,
  HistogramData,
  IChartApi,
  MouseEventParams,
  UTCTimestamp,
  BarPrice,
  Coordinate,
  LogicalRange,
} from 'lightweight-charts'

import { formatSmart, getPercentageDifference } from 'utils'
import Spinner from 'components/common/Spinner'
import { getColorBySign } from 'components/common/Card/card.utils'
import {
  ChartSkeleton,
  WrapperChart,
  ContainerTitle,
  WrapperPeriodButton,
  StyledShimmerBar,
  WrapperTooltipPrice,
} from 'apps/explorer/components/SummaryCardsWidget/VolumeChart/VolumeChart.styled'
import {
  VolumePeriod,
  volumePeriodTitle,
} from 'apps/explorer/components/SummaryCardsWidget/VolumeChart/VolumeChartWidget'
import { numberFormatter } from 'apps/explorer/components/SummaryCardsWidget/utils'
import { useNetworkId } from 'state/network'
import { usePrevious } from 'hooks/usePrevious'

const DEFAULT_CHART_HEIGHT = 214 // px

export interface VolumeDataResponse {
  data?: HistogramData[]
  currentVolume?: number
  changedVolume?: number
  isLoading: boolean
}

export interface VolumeChartProps {
  volumeData: VolumeDataResponse | undefined
  height?: number
  width?: number
  period?: VolumePeriod
  logicalTimeScaleRange?: LogicalRange | undefined
}

export function PeriodButton({
  active,
  isLoading,
  children,
  onClick,
}: React.PropsWithChildren<{ active: boolean; isLoading: boolean | undefined; onClick: () => void }>): JSX.Element {
  return (
    <WrapperPeriodButton active={active} onClick={onClick}>
      {isLoading && active ? <Spinner spin size="1x" /> : children}
    </WrapperPeriodButton>
  )
}

function _formatAmount(amount: string): string {
  return formatSmart({ amount, precision: 0, decimals: 0 })
}

function _buildChart(
  chartContainer: HTMLDivElement,
  width: number | undefined,
  height: number,
  theme: DefaultTheme,
): IChartApi {
  return createChart(chartContainer, {
    width,
    height,
    handleScroll: false,
    handleScale: false,
    layout: {
      backgroundColor: 'transparent',
      textColor: theme.textPrimary1,
    },
    rightPriceScale: {
      scaleMargins: {
        top: 0.5,
        bottom: 0.2,
      },
      visible: false,
    },
    leftPriceScale: {
      visible: false,
    },
    timeScale: {
      visible: false,
      minBarSpacing: 0,
    },
    grid: {
      horzLines: {
        visible: false,
      },
      vertLines: {
        visible: false,
      },
    },
    crosshair: {
      horzLine: {
        visible: true,
        style: 3,
        width: 1,
        labelVisible: false,
        color: theme.borderPrimary,
      },
      vertLine: {
        visible: true,
        style: 3,
        width: 1,
        color: theme.borderPrimary,
        labelVisible: false,
      },
    },
  })
}

interface CrossHairCoordinates {
  top: Coordinate
  left: number
}

interface CrossHairData {
  time: UTCTimestamp
  value: BarPrice
  coordinates: CrossHairCoordinates
}

const PriceTooltip = ({
  crossHairData,
  period,
  containerWidth,
}: {
  crossHairData: CrossHairData | null
  period: VolumePeriod | undefined
  containerWidth: number | undefined
}): JSX.Element | null => {
  const { time, value, coordinates } = crossHairData || {}
  const isTopCoordinateValid = coordinates && coordinates.top > 1
  const formattedDate = React.useMemo(() => {
    if (!time) return ''

    let _format = 'MMM d, yyyy'
    if (period === VolumePeriod.DAILY) {
      _format = 'MMM d HH:mm, yyyy'
    }

    return format(fromUnixTime(time), _format)
  }, [period, time])

  if (!value || !containerWidth || !coordinates || !isTopCoordinateValid) return null

  const TOOLTIP_WIDTH = 130 // px
  const TOOLTIP_HEIGHT = 54 // px
  const H_TOOLTIP_MARGIN = 15 // px
  const V_TOOLTIP_MARGIN = 60 // px
  const leftPosition = Math.max(
    H_TOOLTIP_MARGIN,
    Math.min(containerWidth - (TOOLTIP_WIDTH + H_TOOLTIP_MARGIN), coordinates.left),
  )
  const topPosition =
    coordinates.top - TOOLTIP_HEIGHT - V_TOOLTIP_MARGIN > 0
      ? coordinates.top - TOOLTIP_HEIGHT - H_TOOLTIP_MARGIN
      : Math.max(
          V_TOOLTIP_MARGIN,
          Math.min(containerWidth - TOOLTIP_HEIGHT - H_TOOLTIP_MARGIN, coordinates.top + H_TOOLTIP_MARGIN),
        )

  return (
    <WrapperTooltipPrice left={leftPosition} top={topPosition} width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT}>
      <h4>${_formatAmount(value.toString())}</h4>
      <p className="date">{formattedDate}</p>
    </WrapperTooltipPrice>
  )
}

export function VolumeChart({
  volumeData,
  height = DEFAULT_CHART_HEIGHT,
  width = undefined,
  period,
  children,
  logicalTimeScaleRange,
}: React.PropsWithChildren<VolumeChartProps>): JSX.Element {
  const { data: items, currentVolume, changedVolume, isLoading } = volumeData || {}
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartCreated, setChartCreated] = useState<IChartApi | null | undefined>()
  const theme = useTheme()
  const diffPercentageVolume = currentVolume && changedVolume && getPercentageDifference(currentVolume, changedVolume)
  const captionNameColor = getColorBySign(diffPercentageVolume || 0)
  const [crossHairData, setCrossHairData] = useState<CrossHairData | null>(null)
  const network = useNetworkId()
  const previousPeriod = usePrevious(period)
  const previousNetwork = usePrevious(network)
  const periodTitle = period && volumePeriodTitle.get(period)

  // reset the chart when the volume/network period is changed
  useEffect(() => {
    if ((period !== previousPeriod || network !== previousNetwork) && chartCreated) {
      chartCreated.resize(0, 0)
      setChartCreated(null)
      setCrossHairData(null)
    }
  }, [chartCreated, period, previousPeriod, network, previousNetwork])

  useEffect(() => {
    if (chartCreated || !chartContainerRef.current || !items || isLoading) return

    const chart = _buildChart(chartContainerRef.current, width, height, theme)
    const series = chart.addAreaSeries({
      lineWidth: 1,
      lineColor: theme.orange,
      topColor: theme.orange,
      bottomColor: theme.orangeOpacity,
      priceLineVisible: false,
    })

    series.setData(items)

    chart.subscribeCrosshairMove(function (param: MouseEventParams) {
      if (param === undefined || param.time === undefined || !param.point || param.point.x < 0 || param.point.y < 0) {
        setCrossHairData(null)
        return
      }

      const value = param.seriesPrices.get(series) as BarPrice
      const time = param.time as UTCTimestamp
      const coordinate = series.priceToCoordinate(value) || (0 as Coordinate)
      const shiftedCoordinate = param.point.x
      setCrossHairData({ time, value, coordinates: { top: coordinate, left: shiftedCoordinate } })
    })

    logicalTimeScaleRange
      ? chart.timeScale().setVisibleLogicalRange(logicalTimeScaleRange)
      : chart.timeScale().fitContent()
    setChartCreated(chart)
  }, [captionNameColor, chartCreated, height, isLoading, items, logicalTimeScaleRange, theme, width])

  // resize when window width change
  useEffect(() => {
    if (!width || !chartCreated) return

    chartCreated.resize(width, height)
    chartCreated.timeScale().scrollToPosition(0, false)
  }, [chartCreated, height, width])

  if (isLoading && chartCreated === undefined)
    return (
      <ChartSkeleton>
        <h2>Loading...</h2>
      </ChartSkeleton>
    )

  return (
    <>
      <WrapperChart ref={chartContainerRef}>
        <ContainerTitle captionColor={captionNameColor}>
          <h3>CoW Protocol {periodTitle} volume</h3>
          <span>
            {isLoading ? (
              <StyledShimmerBar height={2} />
            ) : (
              <>
                <p>${currentVolume && numberFormatter(currentVolume)}</p>
                <p className="caption">
                  {(diffPercentageVolume ?? 0) > 0 ? '+' : ''}
                  {diffPercentageVolume && _formatAmount(diffPercentageVolume.toString())}%
                </p>
              </>
            )}
          </span>
        </ContainerTitle>
        <PriceTooltip crossHairData={crossHairData} period={period} containerWidth={width} />
        {children && <div className="time-selector">{children}</div>}
      </WrapperChart>
      {isLoading && <ChartSkeleton backgroundColor="orange" />}
    </>
  )
}
