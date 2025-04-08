import React, { useEffect, useState } from 'react'

import { Color } from '@cowprotocol/ui'
import { UiOrderType } from '@cowprotocol/types'

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  Brush,
} from 'recharts'
import styled from 'styled-components/macro'
import { Order } from 'api/operator'
import { CircularProgress, Typography } from '@mui/material'

// Types
export type OrderStatus =
  | 'created'
  | 'ready'
  | 'filtered'
  | 'invalid'
  | 'executing'
  | 'considered'
  | 'traded'
  | 'cancelled'
export type OrderType = 'Market' | 'Limit'

// Convert UiOrderType to chart's OrderType
const getChartOrderType = (uiOrderType: UiOrderType): OrderType => {
  switch (uiOrderType) {
    case UiOrderType.SWAP:
      return 'Market'
    case UiOrderType.LIMIT:
      return 'Limit'
    default:
      return 'Market' // Default to Market for other types
  }
}

interface ChartDataPoint {
  timestamp: number
  marketPrice: number
  expectedFillPrice: number
  fillableAmount?: [number, number] // Array of [marketPrice, expectedFillPrice] when fillable
  isFillable?: boolean // Flag to indicate if order is in fillable zone
  fillableY?: number // DEPRECATED: Y value for fillable zone: marketPrice when fillable, limitPrice otherwise
  fillableDifference?: number // NEW: Difference between market and expected fill when fillable
  status?: OrderStatus
  isStatusChange: boolean
  gasPrice: number // in Gwei
}

interface OrderStatusTimelineChartProps {
  orderType?: UiOrderType
  height?: number
  width?: number
  orderId: string
  order: Order
}

// Status colors
const STATUS_COLORS: Record<OrderStatus, string> = {
  created: '#6F7EAE', // Soft blue
  ready: '#4DB6AC', // Teal
  filtered: '#E57373', // Red
  invalid: '#E57373', // Red
  executing: '#FFB74D', // Amber
  considered: '#4DB6AC', // Teal
  traded: '#66BB6A', // Green
  cancelled: '#E57373', // Red
}

// Format price for tooltip and axis labels
const formatPrice = (price: string | number): string => {
  if (typeof price === 'string') {
    // Try to parse the string to a number
    const numPrice = parseFloat(price)
    if (isNaN(numPrice)) return price
    price = numPrice
  }

  // Format with appropriate precision
  if (price >= 1000) {
    return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
  } else if (price >= 100) {
    return price.toFixed(3)
  } else if (price >= 10) {
    return price.toFixed(4)
  } else if (price >= 1) {
    return price.toFixed(5)
  } else {
    // For values less than 1, show more decimal places
    return price.toFixed(8)
  }
}

// Line colors
const CHART_COLORS = {
  marketPrice: Color.explorer_green,
  gasPrice: Color.explorer_blue1,
  expectedFillPrice: Color.explorer_yellow4,
  limitPrice: Color.explorer_orange1,
  fillableZone: Color.explorer_green + '33', // 20% opacity version of green
  fillableZoneLimit: Color.explorer_green + '66', // 40% opacity version of green for limit orders
  fillableArea: Color.explorer_blue2, // Use blue for fillable area
  grid: Color.explorer_greyShade, // Grid lines color
}

// Helper function to get status for any minute
const getStatusForMinute = (minute: number): OrderStatus => {
  if (minute < 29) return 'created'
  if (minute < 32) return 'considered'
  if (minute < 34) return 'executing'
  return 'traded'
}

// Helper function to create a ChartDataPoint from interpolated data
const createDataPoint = (data: any, baseTime: number): ChartDataPoint => {
  const point: ChartDataPoint = {
    timestamp: baseTime + data.minute * 60 * 1000,
    marketPrice: data.marketPrice,
    expectedFillPrice: data.expectedFillPrice,
    gasPrice: data.gasPrice,
    status: data.status || getStatusForMinute(data.minute),
    isStatusChange: Boolean(data.isStatusChange), // Ensure it's a boolean
  }

  // Calculate fillable area coordinates when market price is below expected fill price
  if (point.marketPrice < point.expectedFillPrice) {
    point.fillableAmount = [point.marketPrice, point.expectedFillPrice]
  }

  if (point.marketPrice >= point.expectedFillPrice) {
    point.isFillable = true
    point.fillableDifference = point.marketPrice - point.expectedFillPrice
  }

  return point
}

// Helper function to get the current status at a given timestamp
const getCurrentStatus = (data: ChartDataPoint[], timestamp: number): OrderStatus | undefined => {
  // Find the most recent status change before or at this timestamp
  const statusPoints = data
    .filter((point) => point.isStatusChange && point.status && point.timestamp <= timestamp)
    .sort((a, b) => b.timestamp - a.timestamp)

  return statusPoints[0]?.status
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    payload: ChartDataPoint
  }>
  label?: number
  orderType: OrderType
  coordinate?: {
    x: number
    y: number
  }
  limitPrice: number
  allData: ChartDataPoint[] // Add this prop to access all data points
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  orderType,
  coordinate,
  limitPrice,
  allData,
}) => {
  if (!active || !payload || !payload.length || !coordinate) {
    return null
  }

  const data = payload[0].payload
  const timestamp = new Date(label || 0)
  const currentStatus = getCurrentStatus(allData, data.timestamp)

  return (
    <div
      style={{
        backgroundColor: Color.explorer_bg,
        padding: '16px',
        border: `1px solid ${Color.explorer_greyShade}`,
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'absolute',
        transform: 'translate(-120%, -50%)',
        left: coordinate.x,
        top: coordinate.y,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          borderBottom: `1px solid ${Color.explorer_greyShade}`,
          marginBottom: '8px',
          paddingBottom: '4px',
          fontSize: '12px',
          color: Color.explorer_greyShade,
        }}
      >
        {timestamp.toLocaleString()}
      </div>
      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
        <span style={{ color: Color.neutral100 }}>Market Price: </span>
        <span style={{ color: CHART_COLORS.marketPrice }}>
          {data.marketPrice ? formatPrice(data.marketPrice) : 'N/A'}
        </span>
      </div>
      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
        <span style={{ color: Color.neutral100 }}>Gas Price: </span>
        <span style={{ color: CHART_COLORS.gasPrice }}>{data.gasPrice.toFixed(1)} Gwei</span>
      </div>
      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
        <span style={{ color: Color.neutral100 }}>Expected Fill: </span>
        <span style={{ color: CHART_COLORS.expectedFillPrice }}>{formatPrice(data.expectedFillPrice)}</span>
        <div style={{ fontSize: '12px', color: Color.explorer_greyShade }}>(includes gas cost impact)</div>
      </div>
      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
        <span style={{ color: Color.neutral100 }}>Limit Price: </span>
        <span style={{ color: CHART_COLORS.limitPrice }}>{formatPrice(limitPrice)}</span>
      </div>
      {currentStatus && (
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', marginRight: '8px', color: Color.neutral100 }}>Status:</span>
          <div
            style={{
              backgroundColor: STATUS_COLORS[currentStatus],
              color: Color.explorer_bg,
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 500,
            }}
          >
            {currentStatus}
          </div>
        </div>
      )}
    </div>
  )
}

// Custom label component for reference lines
interface CustomLabelProps {
  value?: string
  viewBox?: {
    x?: number
    y?: number
    height?: number
    width?: number
  }
  onHover?: (status: string | null) => void
}

const CustomLabel: React.FC<CustomLabelProps> = ({ value, viewBox, onHover }) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const textRef = React.useRef<SVGTextElement>(null)
  const [textWidth, setTextWidth] = React.useState(0)

  if (!value || !viewBox?.x || !viewBox?.y || !viewBox?.height) return null

  const y = viewBox.y + viewBox.height - 30
  const labelHeight = 20
  const horizontalPadding = 9 // Same as LimitPriceLabel

  React.useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox()
      setTextWidth(bbox.width + horizontalPadding * 2) // Add padding to both sides
    }
  }, [value])

  const handleMouseEnter = () => {
    setIsHovered(true)
    onHover?.(value)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    onHover?.(null)
  }

  return (
    <g
      transform={`translate(${viewBox.x},${y})`}
      style={{ cursor: 'pointer' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <rect
        x={-(textWidth / 2) || -30} // Center the rect around x=0, fallback to -30 until measured
        y={0}
        width={textWidth || 60} // Use measured width, fallback to 60 until measured
        height={labelHeight}
        rx={6}
        fill={STATUS_COLORS[value as OrderStatus]}
        style={{
          filter: isHovered ? 'brightness(1.1)' : undefined,
          transition: 'filter 0.2s ease',
        }}
      />
      <text
        ref={textRef}
        x={0}
        y={14}
        textAnchor="middle"
        fill={Color.explorer_bg}
        fontSize={11}
        style={{ pointerEvents: 'none' }}
      >
        {value}
      </text>
    </g>
  )
}

// Custom label component for limit price
interface LimitPriceLabelProps {
  value?: number
  viewBox?: {
    x?: number
    y?: number
  }
}

const LimitPriceLabel: React.FC<LimitPriceLabelProps> = ({ value, viewBox }) => {
  const textRef = React.useRef<SVGTextElement>(null)
  const [textWidth, setTextWidth] = React.useState(0)

  if (!value || !viewBox?.x || !viewBox?.y) return null

  const labelHeight = 20
  const verticalOffset = -labelHeight / 2
  const horizontalPadding = 9

  React.useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox()
      setTextWidth(bbox.width + horizontalPadding * 2) // Add padding to both sides
    }
  }, [value])

  return (
    <g transform={`translate(${viewBox.x + 5},${viewBox.y})`}>
      <rect
        x={0}
        y={verticalOffset}
        width={textWidth || 100} // Fallback width until text is measured
        height={labelHeight}
        rx={6}
        fill={CHART_COLORS.limitPrice}
      />
      <text
        ref={textRef}
        x={horizontalPadding} // Position text after left padding
        y={verticalOffset + labelHeight / 2 + 4}
        textAnchor="start" // Align from the start since we're using absolute positioning
        fill={Color.explorer_bg}
        fontSize={12}
        fontWeight={500}
      >
        Limit Price: {formatPrice(value)}
      </text>
    </g>
  )
}

// Styled components
const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  padding-bottom: 20px;
`

// Types for API responses
interface StatusEvent {
  time: number
  value: string
}

interface PricePoint {
  time: number
  fillPrice: string
  gasPriceGwei: string
  sellTokenPriceInEthWei: string
}

interface MarketPricePoint {
  time: number
  value: string
}

const BASE_URL = 'https://bff.barn.cow.fi/1/orders/%7BorderId%7D'

// Hook to fetch and transform data
const useOrderData = (orderId: string) => {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch fill price, market price, and status events data
        const [fillPriceResponse, marketPriceResponse, statusEventsResponse] = await Promise.all([
          fetch(`${BASE_URL}/estimatedFillPrice?orderId=${orderId}`),
          fetch(`${BASE_URL}/marketPrice?orderId=${orderId}`),
          fetch(`${BASE_URL}/statusEvents?orderId=${orderId}`),
        ])

        if (!fillPriceResponse.ok || !marketPriceResponse.ok || !statusEventsResponse.ok) {
          throw new Error(
            `HTTP error! status: ${fillPriceResponse.status} / ${marketPriceResponse.status} / ${statusEventsResponse.status}`,
          )
        }

        const [fillPriceData, marketPriceData, statusEvents] = await Promise.all([
          fillPriceResponse.json(),
          marketPriceResponse.json(),
          statusEventsResponse.json(),
        ])

        // Create a map of market prices by timestamp for easy lookup
        const marketPriceMap = new Map(
          marketPriceData.map((point: MarketPricePoint) => [point.time, Number(point.value)]),
        )

        // Create a map of status events by timestamp, converting BFF status to our OrderStatus
        const statusEventsMap = new Map(
          statusEvents.map((event: StatusEvent) => [event.time, event.value as OrderStatus]),
        )

        // First, create base data points from fill price data
        let transformedData = fillPriceData.map((point: PricePoint) => {
          const marketPrice = marketPriceMap.get(point.time) ?? null
          const expectedFillPrice = Number(point.fillPrice)

          return {
            timestamp: point.time,
            marketPrice,
            expectedFillPrice,
            gasPrice: parseFloat(point.gasPriceGwei),
            status: undefined,
            isStatusChange: false,
            ...(typeof marketPrice === 'number' && marketPrice < expectedFillPrice
              ? { fillableAmount: [marketPrice, expectedFillPrice] }
              : typeof marketPrice === 'number'
                ? {
                    isFillable: true,
                    fillableDifference: marketPrice - expectedFillPrice,
                  }
                : {}),
          }
        })

        // Then, add data points for status events that don't align with existing timestamps
        statusEvents.forEach((event: StatusEvent) => {
          const status = event.value.toLowerCase() as OrderStatus
          const existingPoint = transformedData.find((point) => point.timestamp === event.time)

          if (existingPoint) {
            // Update existing point with status
            existingPoint.status = status
            existingPoint.isStatusChange = true
          } else {
            // Create new point for status event
            // Find nearest points before and after
            const beforePoint = [...transformedData]
              .sort((a, b) => b.timestamp - a.timestamp)
              .find((point) => point.timestamp < event.time)
            const afterPoint = transformedData.find((point) => point.timestamp > event.time)

            // Interpolate values
            let marketPrice = 0
            let expectedFillPrice = 0
            let gasPrice = 0

            if (beforePoint && afterPoint) {
              const ratio = (event.time - beforePoint.timestamp) / (afterPoint.timestamp - beforePoint.timestamp)
              marketPrice = beforePoint.marketPrice + (afterPoint.marketPrice - beforePoint.marketPrice) * ratio
              expectedFillPrice =
                beforePoint.expectedFillPrice + (afterPoint.expectedFillPrice - beforePoint.expectedFillPrice) * ratio
              gasPrice = beforePoint.gasPrice + (afterPoint.gasPrice - beforePoint.gasPrice) * ratio
            } else if (beforePoint) {
              marketPrice = beforePoint.marketPrice
              expectedFillPrice = beforePoint.expectedFillPrice
              gasPrice = beforePoint.gasPrice
            } else if (afterPoint) {
              marketPrice = afterPoint.marketPrice
              expectedFillPrice = afterPoint.expectedFillPrice
              gasPrice = afterPoint.gasPrice
            }

            const newPoint: ChartDataPoint = {
              timestamp: event.time,
              marketPrice,
              expectedFillPrice,
              gasPrice,
              status,
              isStatusChange: true,
              ...(marketPrice && expectedFillPrice && marketPrice < expectedFillPrice
                ? { fillableAmount: [marketPrice, expectedFillPrice] }
                : marketPrice && expectedFillPrice
                  ? {
                      isFillable: true,
                      fillableDifference: marketPrice - expectedFillPrice,
                    }
                  : {}),
            }

            transformedData.push(newPoint)
          }
        })

        // Sort the data by timestamp
        transformedData.sort((a, b) => a.timestamp - b.timestamp)

        setData(transformedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order data')
      } finally {
        setIsLoading(false)
      }
    }

    if (orderId) {
      fetchData()
    }
  }, [orderId])

  return {
    data,
    isLoading,
    error,
  }
}

export const OrderStatusTimelineChart: React.FC<OrderStatusTimelineChartProps> = ({
  orderType = UiOrderType.SWAP,
  height = 500,
  width,
  orderId,
  order,
}) => {
  const [hoveredStatus, setHoveredStatus] = React.useState<string | null>(null)
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null)
  const { data, isLoading, error } = useOrderData(orderId)

  // Calculate limit price from order data - move this before any conditional returns
  const limitPrice = React.useMemo(() => {
    if (!order.buyAmount || !order.sellAmount || !order.sellToken?.decimals || !order.buyToken?.decimals) return 0

    // Convert amounts from atoms to actual token amounts using decimals
    const sellAmountInUnits = parseFloat(order.sellAmount.toString()) / Math.pow(10, order.sellToken.decimals)
    const buyAmountInUnits = parseFloat(order.buyAmount.toString()) / Math.pow(10, order.buyToken.decimals)

    return sellAmountInUnits / buyAmountInUnits
  }, [order])

  // Calculate y-axis domain based on actual price values - move this before conditional returns
  const yAxisDomain = React.useMemo(() => {
    if (!data.length) return [0, 1]

    const allPrices = data
      .flatMap((point) => [
        point.marketPrice,
        point.expectedFillPrice,
        ...(point.fillableAmount || []),
        ...(limitPrice && limitPrice !== 0 ? [limitPrice] : []),
      ])
      .filter((price) => !isNaN(price) && price !== null && price !== undefined && price !== 0)

    if (allPrices.length === 0) return [0, 1]

    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)
    const range = maxPrice - minPrice

    let paddingPercentage
    if (maxPrice < 0.01) {
      paddingPercentage = 0.05
    } else if (maxPrice < 0.1) {
      paddingPercentage = 0.08
    } else if (maxPrice < 1) {
      paddingPercentage = 0.1
    } else {
      paddingPercentage = 0.15
    }

    const padding = range * paddingPercentage
    const minDomain = Math.max(0, minPrice - padding)
    const maxDomain = maxPrice + padding

    if (maxDomain - minDomain < maxDomain * 0.01) {
      return [Math.max(0, minDomain - maxDomain * 0.01), maxDomain + maxDomain * 0.01]
    }

    return [minDomain, maxDomain]
  }, [data, limitPrice])

  // Filter status changes
  const statusChanges = React.useMemo(() => {
    return data.filter((point) => point.isStatusChange && point.status)
  }, [data])

  // Early returns after all hooks are called
  if (isLoading) {
    return (
      <ChartContainer>
        <div style={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </div>
      </ChartContainer>
    )
  }

  if (error) {
    return (
      <ChartContainer>
        <div
          style={{
            height,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <Typography color="error">Failed to load chart data: {error}</Typography>
        </div>
      </ChartContainer>
    )
  }

  if (!data.length) {
    return (
      <ChartContainer>
        <div style={{ height, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>No data available for this order</Typography>
        </div>
      </ChartContainer>
    )
  }

  const chartOrderType = getChartOrderType(orderType)

  return (
    <ChartContainer>
      <ResponsiveContainer width={width || '100%'} height={height}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
          <defs>
            <pattern
              id="fillableAreaPattern"
              patternUnits="userSpaceOnUse"
              width="5"
              height="5"
              patternTransform="rotate(0)"
            >
              <rect width="5" height="5" fill={CHART_COLORS.fillableArea} fillOpacity={0.1} />
              <circle cx="4" cy="4" r="1" fill={CHART_COLORS.fillableArea} fillOpacity="0.75" />
            </pattern>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => {
              const date = new Date(value)
              const minutes = date.getMinutes()
              const roundedMinutes = Math.floor(minutes / 5) * 5
              date.setMinutes(roundedMinutes)
              date.setSeconds(0)
              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }}
            type="number"
            domain={zoomDomain || ['dataMin', 'dataMax']}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            yAxisId="left"
            domain={yAxisDomain}
            tickCount={5}
            tickFormatter={(value) => formatPrice(value)}
            label={{
              value: 'Price',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              style: { fill: Color.explorer_green },
            }}
          />
          <Tooltip
            content={<CustomTooltip orderType={chartOrderType} limitPrice={limitPrice} allData={data} />}
            position={{ x: 0, y: 0 }}
            allowEscapeViewBox={{ x: true, y: true }}
          />
          <Legend />

          <Area
            yAxisId="left"
            dataKey="fillableAmount"
            stroke={CHART_COLORS.fillableArea}
            strokeWidth={1}
            fill="url(#fillableAreaPattern)"
            fillOpacity={1}
            name="Fillable Zone"
            legendType="circle"
            color={CHART_COLORS.fillableArea}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="marketPrice"
            stroke={CHART_COLORS.marketPrice}
            strokeWidth={2}
            dot={false}
            name="Market Price"
            connectNulls={true}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="expectedFillPrice"
            stroke={CHART_COLORS.expectedFillPrice}
            strokeWidth={2}
            name="Expected Fill Price"
            strokeDasharray="5 5"
            dot={false}
          />

          {chartOrderType === 'Market' && (
            <>
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="marketPrice"
                fill={CHART_COLORS.fillableZone}
                fillOpacity={0.3}
                stroke="none"
                name="Fillable Zone"
              />
            </>
          )}

          {chartOrderType === 'Limit' && (
            <>
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="expectedFillPrice"
                stackId="limitFill"
                stroke="none"
                fill="transparent"
                isAnimationActive={false}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="fillableDifference"
                stackId="limitFill"
                name="Fillable Zone"
                fill={CHART_COLORS.fillableZoneLimit}
                fillOpacity={0.4}
                stroke="none"
                isAnimationActive={false}
              />
            </>
          )}

          <ReferenceLine
            y={limitPrice}
            yAxisId="left"
            stroke={CHART_COLORS.limitPrice}
            strokeWidth={1}
            label={<LimitPriceLabel value={limitPrice} />}
          />

          {statusChanges
            .filter((point) => point.status !== hoveredStatus)
            .map((point) => (
              <ReferenceLine
                key={`status-${point.timestamp}`}
                x={point.timestamp}
                yAxisId="left"
                stroke={STATUS_COLORS[point.status!]}
                strokeWidth={2}
                label={<CustomLabel value={point.status!} onHover={(status) => setHoveredStatus(status)} />}
              />
            ))}

          {hoveredStatus &&
            statusChanges
              .filter((point) => point.status === hoveredStatus)
              .map((point) => (
                <ReferenceLine
                  key={`status-${point.timestamp}-hovered`}
                  x={point.timestamp}
                  yAxisId="left"
                  stroke={STATUS_COLORS[point.status!]}
                  strokeWidth={2}
                  label={<CustomLabel value={point.status!} onHover={(status) => setHoveredStatus(status)} />}
                />
              ))}

          <Brush
            dataKey="timestamp"
            height={40}
            stroke={CHART_COLORS.marketPrice}
            fill={Color.explorer_bg}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }}
            onChange={(brushData) => {
              if (
                brushData.startIndex === undefined ||
                brushData.endIndex === undefined ||
                brushData.startIndex === brushData.endIndex
              ) {
                setZoomDomain(null)
                return
              }
              const startTime = data[brushData.startIndex]?.timestamp
              const endTime = data[brushData.endIndex]?.timestamp
              if (startTime && endTime) {
                setZoomDomain([startTime, endTime])
              }
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export default OrderStatusTimelineChart
