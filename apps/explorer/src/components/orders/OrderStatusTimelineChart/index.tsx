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
} from 'recharts'
import styled from 'styled-components/macro'
import { Order } from 'api/operator'

// Types
export type OrderStatus = 'Ready' | 'Considered' | 'Executing' | 'Settled' | 'Expired'
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
  Ready: '#6F7EAE', // Soft blue
  Considered: '#FFB74D', // Amber
  Executing: '#4DB6AC', // Teal
  Settled: '#66BB6A', // Green
  Expired: '#E57373', // Red
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
  if (minute < 29) return 'Ready'
  if (minute < 32) return 'Considered'
  if (minute < 34) return 'Executing'
  return 'Settled'
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

// Update CustomTooltip to show the correct limit price
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
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, orderType, coordinate, limitPrice }) => {
  if (!active || !payload || !payload.length || !coordinate) {
    return null
  }

  const data = payload[0].payload
  const timestamp = new Date(label || 0)

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
        <span style={{ color: CHART_COLORS.marketPrice }}>${data.marketPrice.toFixed(2)}</span>
      </div>
      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
        <span style={{ color: Color.neutral100 }}>Gas Price: </span>
        <span style={{ color: CHART_COLORS.gasPrice }}>{data.gasPrice.toFixed(1)} Gwei</span>
      </div>
      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
        <span style={{ color: Color.neutral100 }}>Expected Fill: </span>
        <span style={{ color: CHART_COLORS.expectedFillPrice }}>${data.expectedFillPrice.toFixed(2)}</span>
        <div style={{ fontSize: '12px', color: Color.explorer_greyShade }}>(includes gas cost impact)</div>
      </div>
      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
        <span style={{ color: Color.neutral100 }}>Limit Price: </span>
        <span style={{ color: CHART_COLORS.limitPrice }}>${limitPrice.toFixed(2)}</span>
      </div>
      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', marginRight: '8px', color: Color.neutral100 }}>Status:</span>
        <div
          style={{
            backgroundColor: STATUS_COLORS[data.status!],
            color: Color.explorer_bg,
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 500,
          }}
        >
          {data.status}
        </div>
      </div>
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
        Limit Price: ${value}
      </text>
    </g>
  )
}

// Styled components
const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
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

const BASE_URL = 'https://bff.barn.cow.fi/1/orders/%7BorderId%7D'

// Hook to fetch and transform data
const useOrderData = (orderId: string) => {
  const [statusEvents, setStatusEvents] = useState<StatusEvent[]>([])
  const [marketPrices, setMarketPrices] = useState<PricePoint[]>([])
  const [estimatedFillPrices, setEstimatedFillPrices] = useState<PricePoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Use exact URLs as provided, only append orderId
        const statusUrl = `https://bff.barn.cow.fi/1/orders/%7BoderId%7D/statusEvents?orderId=${orderId}`
        const marketPriceUrl = `https://bff.barn.cow.fi/1/orders/%7BoderId%7D/marketPrice?orderId=${orderId}`
        const estimatedFillPriceUrl = `https://bff.barn.cow.fi/1/orders/%7BoderId%7D/estimatedFillPrice?orderId=${orderId}`

        // Log the URLs being called
        console.log('Fetching from URLs:', {
          statusUrl,
          marketPriceUrl,
          estimatedFillPriceUrl,
        })

        // Fetch data from all endpoints
        const [statusRes, marketPriceRes, estimatedFillPriceRes] = await Promise.all([
          fetch(statusUrl),
          fetch(marketPriceUrl),
          fetch(estimatedFillPriceUrl),
        ])

        // Log response statuses
        console.log('Response statuses:', {
          status: statusRes.status,
          market: marketPriceRes.status,
          estimatedFill: estimatedFillPriceRes.status,
        })

        // Check if any response is not ok
        if (!statusRes.ok || !marketPriceRes.ok || !estimatedFillPriceRes.ok) {
          throw new Error('One or more API calls failed')
        }

        const [statusData, marketPriceData, estimatedFillPriceData] = await Promise.all([
          statusRes.json(),
          marketPriceRes.json(),
          estimatedFillPriceRes.json(),
        ])

        setStatusEvents(statusData)
        setMarketPrices(marketPriceData)
        setEstimatedFillPrices(estimatedFillPriceData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setIsLoading(false)
      }
    }

    if (orderId) {
      fetchData()
    }
  }, [orderId])

  // Transform data into chart format
  const transformData = (): ChartDataPoint[] => {
    if (!marketPrices.length || !estimatedFillPrices.length) return []

    // Create a map of status changes
    const statusMap = new Map<number, string>()
    statusEvents.forEach((event) => {
      statusMap.set(event.time, event.value)
    })

    // Combine market prices and estimated fill prices
    const allTimePoints = Array.from(
      new Set([...marketPrices.map((p) => p.time), ...estimatedFillPrices.map((p) => p.time)]),
    ).sort((a, b) => a - b)

    let lastStatus = ''

    const transformedData = allTimePoints.map((time) => {
      const marketPricePoint = marketPrices.find((p) => p.time === time)
      const estimatedFillPricePoint = estimatedFillPrices.find((p) => p.time === time)

      // Parse prices directly from the API response
      const marketPrice = marketPricePoint ? parseFloat(marketPricePoint.fillPrice) : 0
      const expectedFillPrice = estimatedFillPricePoint ? parseFloat(estimatedFillPricePoint.fillPrice) : 0
      const gasPrice = estimatedFillPricePoint ? parseFloat(estimatedFillPricePoint.gasPriceGwei) : 0

      const currentStatus = statusMap.get(time)

      // Determine if this is a status change point
      const isStatusChange = currentStatus && currentStatus !== lastStatus
      if (currentStatus) {
        lastStatus = currentStatus
      }

      const point: ChartDataPoint = {
        timestamp: time,
        marketPrice,
        expectedFillPrice,
        gasPrice,
        isStatusChange: Boolean(isStatusChange),
        status: (currentStatus?.toUpperCase() as OrderStatus) || (lastStatus?.toUpperCase() as OrderStatus),
      }

      // Calculate fillable amount when market price is below expected fill price
      if (marketPrice < expectedFillPrice) {
        point.fillableAmount = [marketPrice, expectedFillPrice]
      }

      if (marketPrice >= expectedFillPrice) {
        point.isFillable = true
        point.fillableDifference = marketPrice - expectedFillPrice
      }

      return point
    })

    return transformedData
  }

  return {
    data: transformData(),
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
  // Group all hooks at the top
  const [hoveredStatus, setHoveredStatus] = React.useState<string | null>(null)
  const { data, isLoading, error } = useOrderData(orderId)

  // Calculate limit price from order data
  const limitPrice = React.useMemo(() => {
    if (!order.buyAmount || !order.sellAmount) return 0
    return parseFloat(order.sellAmount.toString()) / parseFloat(order.buyAmount.toString())
  }, [order])

  // Filter status changes
  const statusChanges = React.useMemo(() => data.filter((point) => point.isStatusChange), [data])

  const chartOrderType = getChartOrderType(orderType)

  // Calculate y-axis domain based on actual prices
  const yAxisDomain = React.useMemo(() => {
    if (!data.length) return [0, 1] // Default domain if no data

    const allPrices = data.flatMap((point) => [point.marketPrice, point.expectedFillPrice])
    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)

    // Add 10% padding to the range
    const padding = (maxPrice - minPrice) * 0.1
    return [
      Math.max(0, minPrice - padding), // Don't go below 0
      maxPrice + padding,
    ]
  }, [data])

  if (isLoading) {
    return <div>Loading chart data...</div>
  }

  if (error) {
    return <div>Error loading chart data: {error}</div>
  }

  return (
    <ChartContainer>
      <ResponsiveContainer width={width || '100%'} height={height}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
            domain={['dataMin', 'dataMax']}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            yAxisId="left"
            domain={yAxisDomain}
            tickCount={5}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            label={{
              value: 'Price (USD)',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              style: { fill: Color.explorer_green },
            }}
          />
          {/* TODO: Right Y-axis temporarily hidden along with gas price line
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 150]}
            tickCount={6}
            tickFormatter={(value) => `${value.toFixed(0)} Gwei`}
            label={{
              value: 'Gas Price (Gwei)',
              angle: 90,
              position: 'insideRight',
              offset: 10,
              style: { fill: Color.explorer_blue1 },
            }}
          />
          */}
          <Tooltip
            content={<CustomTooltip orderType={chartOrderType} limitPrice={limitPrice} />}
            position={{ x: 0, y: 0 }}
            allowEscapeViewBox={{ x: true, y: true }}
          />
          <Legend />

          {/* Update the Area component to use the pattern */}
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
          />

          {/* Gas price line */}
          {/* TODO: Gas price line temporarily hidden for better price visualization clarity
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="gasPrice"
            stroke={CHART_COLORS.gasPrice}
            name="Gas Price"
            dot={false}
          />
          */}

          {/* Expected fill price line */}
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

          {/* Fillable zone for Market orders */}
          {chartOrderType === 'Market' && (
            <>
              {/* Base Area up to market price */}
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

          {/* Fillable zone for Limit orders - STACKED APPROACH */}
          {chartOrderType === 'Limit' && (
            <>
              {/* Base Area (represents the expectedFillPrice line itself) */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="expectedFillPrice" // The base line
                stackId="limitFill" // Stack group identifier
                stroke="none"
                fill="transparent" // Make base transparent so only the difference is colored
                isAnimationActive={false}
              />
              {/* Difference Area (shows the actual fillable zone above expectedFillPrice) */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="fillableDifference" // The difference to stack on top
                stackId="limitFill" // Same stack group identifier
                name="Fillable Zone"
                fill={CHART_COLORS.fillableZoneLimit}
                fillOpacity={0.4} // Adjusted opacity
                stroke="none"
                isAnimationActive={false}
              />
            </>
          )}

          {/* Limit price reference line */}
          <ReferenceLine
            y={limitPrice}
            yAxisId="left"
            stroke={CHART_COLORS.limitPrice}
            strokeWidth={1}
            label={<LimitPriceLabel value={limitPrice} />}
          />

          {/* Render non-hovered status lines first */}
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

          {/* Render hovered status line last to appear on top */}
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
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export default OrderStatusTimelineChart
