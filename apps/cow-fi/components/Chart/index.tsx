import LineChart from '@/components/Chart/LineChart'
import { bisect, curveCardinal, NumberValue, scaleLinear, timeDay, timeHour, timeMinute, timeMonth } from 'd3'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AxisBottom, TickFormatter } from '@visx/axis'
import {
  dayHourFormatter,
  hourFormatter,
  monthDayFormatter,
  monthTickFormatter,
  monthYearDayFormatter,
  weekFormatter,
} from 'util/formatChartTimes'
import { Line } from '@visx/shape'
import { GlyphCircle } from '@visx/glyph'
import { localPoint } from '@visx/event'
import { EventType } from '@visx/event/lib/types'
import { Color } from 'styles/variables'
import { getPriceChangeColor } from 'util/getPriceChangeColor'
import { MissingPriceChart } from './MissingChart'
import {
  ArrowCell,
  ChartHeader,
  DeltaContainer,
  MissingPrice,
  MissingPriceCaption,
  StyledDownArrow,
  StyledUpArrow,
  TokenPrice,
  TokenPriceWrapper,
} from './styled'
import { formatUSDPrice } from 'util/formatUSDPrice'

export type PricePoint = { timestamp: number; value: number }

export enum TimePeriod {
  HOUR,
  DAY,
  WEEK,
  MONTH,
  YEAR,
}

export type ChartProps = {
  width?: number
  height?: number
  prices: any
  timePeriod: TimePeriod
}

const DATA_EMPTY = { value: 0, timestamp: 0 }

export function getPriceBounds(pricePoints: PricePoint[]): [number, number] {
  const prices = pricePoints.map((x) => x.value)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return [min, max]
}

function calculateDelta(start: number, current: number) {
  return (current / start - 1) * 100
}

export function getDeltaArrow(delta: number | null | undefined, iconSize = 20) {
  // Null-check not including zero
  if (delta === null || delta === undefined) {
    return null
  } else if (Math.sign(delta) < 0) {
    return <StyledDownArrow size={iconSize} key="arrow-down" aria-label="down" />
  }
  return <StyledUpArrow size={iconSize} key="arrow-up" aria-label="up" />
}

export function formatDelta(delta: number | null | undefined) {
  // Null-check not including zero
  if (delta === null || delta === undefined || delta === Infinity || isNaN(delta)) {
    return '-'
  }
  const formattedDelta = Math.abs(delta).toFixed(2) + '%'
  return formattedDelta
}

export function Chart({ prices, height, width, timePeriod }: ChartProps) {
  const chartAvailable = !!prices && prices.length > 0

  const missingPricesMessage = !chartAvailable ? (
    prices?.length === 0 ? (
      <>
        <span>Missing price data due to recently low trading volume</span>
      </>
    ) : (
      <span>Missing chart data</span>
    )
  ) : null

  const locale = 'en-US'

  const startingPrice = prices?.[0] ?? DATA_EMPTY
  const endingPrice = prices?.[prices.length - 1] ?? DATA_EMPTY
  const margin = { top: 100, bottom: 48, crosshair: 72 }

  const graphInnerHeight = height - margin.top - margin.bottom > 0 ? height - margin.top - margin.bottom : 0

  const curveTension = 1

  // y scale
  const rdScale = useMemo(
    () =>
      scaleLinear()
        .domain(getPriceBounds(prices ?? []))
        .range([graphInnerHeight, 0]),
    [prices, graphInnerHeight]
  )

  // x scale
  const timeScale = useMemo(
    () => scaleLinear().domain([startingPrice.timestamp, endingPrice.timestamp]).range([0, width]),
    [startingPrice, endingPrice, width]
  )

  const getX = useMemo(() => (p: PricePoint) => timeScale(p.timestamp), [timeScale])
  const getY = useMemo(() => (p: PricePoint) => rdScale(p.value), [rdScale])
  const curve = useMemo(() => curveCardinal.tension(curveTension), [curveTension])

  const [crosshair, setCrosshair] = useState<number | null>(null)
  const [displayPrice, setDisplayPrice] = useState(startingPrice)

  useEffect(() => {
    setDisplayPrice(endingPrice)
  }, [prices, endingPrice])

  function tickFormat(
    timePeriod: TimePeriod,
    locale: string
  ): [TickFormatter<NumberValue>, (v: number) => string, NumberValue[]] {
    const offsetTime = (endingPrice.timestamp.valueOf() - startingPrice.timestamp.valueOf()) / 24
    const startDateWithOffset = new Date((startingPrice.timestamp.valueOf() + offsetTime) * 1000)
    const endDateWithOffset = new Date((endingPrice.timestamp.valueOf() - offsetTime) * 1000)
    switch (timePeriod) {
      case TimePeriod.HOUR: {
        const interval = timeMinute.every(5)

        return [
          hourFormatter(locale),
          dayHourFormatter(locale),
          (interval ?? timeMinute)
            .range(startDateWithOffset, endDateWithOffset, interval ? 2 : 10)
            .map((x) => x.valueOf() / 1000),
        ]
      }
      case TimePeriod.DAY:
        return [
          hourFormatter(locale),
          dayHourFormatter(locale),
          timeHour.range(startDateWithOffset, endDateWithOffset, 4).map((x) => x.valueOf() / 1000),
        ]
      case TimePeriod.WEEK:
        return [
          weekFormatter(locale),
          dayHourFormatter(locale),
          timeDay.range(startDateWithOffset, endDateWithOffset, 1).map((x) => x.valueOf() / 1000),
        ]
      case TimePeriod.MONTH:
        return [
          monthDayFormatter(locale),
          dayHourFormatter(locale),
          timeDay.range(startDateWithOffset, endDateWithOffset, 7).map((x) => x.valueOf() / 1000),
        ]
      case TimePeriod.YEAR:
        return [
          monthTickFormatter(locale),
          monthYearDayFormatter(locale),
          timeMonth.range(startDateWithOffset, endDateWithOffset, 2).map((x) => x.valueOf() / 1000),
        ]
    }
  }

  const [tickFormatter, crosshairDateFormatter, ticks] = tickFormat(timePeriod, locale)
  //max ticks based on screen size
  const maxTicks = Math.floor(width / 100)
  function calculateTicks(ticks: NumberValue[]) {
    const newTicks = []
    const tickSpacing = Math.floor(ticks.length / maxTicks)
    for (let i = 1; i < ticks.length; i += tickSpacing) {
      newTicks.push(ticks[i])
    }
    return newTicks
  }

  const updatedTicks = maxTicks > 0 ? (ticks.length > maxTicks ? calculateTicks(ticks) : ticks) : []
  const delta = calculateDelta(startingPrice.value, displayPrice.value)
  const formattedDelta = formatDelta(delta)
  const arrow = getDeltaArrow(delta)
  const crosshairEdgeMax = width * 0.85
  const crosshairAtEdge = !!crosshair && crosshair > crosshairEdgeMax

  useEffect(() => {
    setCrosshair(null)
  }, [timePeriod])

  const handleHover = useCallback(
    (event: Element | EventType) => {
      if (!prices) return

      const { x } = localPoint(event) || { x: 0 }
      const x0 = timeScale.invert(x) // get timestamp from the scalexw
      const index = bisect(
        prices.map((x) => x.timestamp),
        x0,
        1
      )

      const d0 = prices[index - 1]
      const d1 = prices[index]
      let pricePoint = d0

      const hasPreviousData = d1 && d1.timestamp
      if (hasPreviousData) {
        pricePoint = x0.valueOf() - d0.timestamp.valueOf() > d1.timestamp.valueOf() - x0.valueOf() ? d1 : d0
      }

      if (pricePoint) {
        setCrosshair(timeScale(pricePoint.timestamp))
        setDisplayPrice(pricePoint)
      }
    },
    [timeScale, prices]
  )

  const resetDisplay = useCallback(() => {
    setCrosshair(null)
    setDisplayPrice(endingPrice)
  }, [setCrosshair, setDisplayPrice, endingPrice])

  const mainColor = Color.lightBlue3

  return (
    <>
      <ChartHeader data-cy="chart-header">
        {displayPrice.value ? (
          <TokenPriceWrapper>
            <TokenPrice>{formatUSDPrice(displayPrice.value)}</TokenPrice>

            <DeltaContainer>
              {formattedDelta}
              <ArrowCell>{arrow}</ArrowCell>
            </DeltaContainer>
          </TokenPriceWrapper>
        ) : (
          <>
            <MissingPrice>Price Unavailable</MissingPrice>
            <MissingPriceCaption>{missingPricesMessage}</MissingPriceCaption>
          </>
        )}
      </ChartHeader>

      {!chartAvailable ? (
        <MissingPriceChart width={width} height={height} message={!!displayPrice.value && missingPricesMessage} />
      ) : (
        <svg data-cy="price-chart" width={width} height={height} style={{ minWidth: '100%', maxWidth: '100%' }}>
          <LineChart
            width={width}
            height={height}
            data={prices}
            getX={getX}
            getY={getY}
            marginTop={margin.top}
            curve={curve}
            strokeWidth={2}
            color={mainColor}
          />

          {crosshair !== null ? (
            <g>
              <AxisBottom
                scale={timeScale}
                stroke={Color.text1}
                tickFormat={tickFormatter}
                tickStroke={Color.text1}
                tickLength={4}
                hideTicks={true}
                tickTransform="translate(0 -5)"
                tickValues={updatedTicks}
                top={height - 1}
                tickLabelProps={() => ({
                  fill: Color.text1,
                  fontSize: 11,
                  textAnchor: 'middle',
                  transform: 'translate(0 -24)',
                })}
              />
              <text
                x={crosshair + (crosshairAtEdge ? -4 : 4)}
                y={margin.crosshair + 10}
                textAnchor={crosshairAtEdge ? 'end' : 'start'}
                fontSize={15}
                fill={Color.text1}
              >
                {crosshairDateFormatter(displayPrice.timestamp)}
              </text>
              <Line
                from={{ x: crosshair, y: margin.crosshair }}
                to={{ x: crosshair, y: height }}
                stroke={Color.text1}
                strokeWidth={1}
                pointerEvents="none"
                strokeDasharray="4,4"
              />
              <GlyphCircle
                left={crosshair}
                top={rdScale(displayPrice.value) + margin.top}
                size={50}
                fill={mainColor}
                stroke={mainColor}
                strokeWidth={0.5}
              />
            </g>
          ) : (
            <AxisBottom hideAxisLine={true} scale={timeScale} stroke={Color.text1} top={height - 1} hideTicks />
          )}
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="transparent"
            onTouchStart={handleHover}
            onTouchMove={handleHover}
            onMouseMove={handleHover}
            onMouseLeave={resetDisplay}
          />
        </svg>
      )}
    </>
  )
}
