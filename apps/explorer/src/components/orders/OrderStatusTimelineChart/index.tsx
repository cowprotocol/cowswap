import React from 'react'

import { Color } from '@cowprotocol/ui'

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

// Types
export type OrderStatus = 'Ready' | 'Considered' | 'Executing' | 'Settled' | 'Expired'
export type OrderType = 'Market' | 'Limit'

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
  orderType?: OrderType
  height?: number
  width?: number
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
  fillableArea: Color.explorer_green + '20', // 12% opacity version of green for the area between lines
}

// Demo data with explicit data points
const DEMO_LIMIT_PRICE = 100

const DEMO_DATA_POINTS = [
  // 0-30 min: Ready. Market Price starts above expected fill, trending down
  { minute: 0, marketPrice: 104.5, expectedFillPrice: 97.5, gasPrice: 45, status: 'Ready', isStatusChange: true },
  { minute: 5, marketPrice: 103.8, expectedFillPrice: 97.8, gasPrice: 43 },
  { minute: 10, marketPrice: 103.2, expectedFillPrice: 98.1, gasPrice: 40 },
  { minute: 15, marketPrice: 102.5, expectedFillPrice: 98.4, gasPrice: 38 },
  { minute: 20, marketPrice: 101.8, expectedFillPrice: 98.7, gasPrice: 35 },
  { minute: 25, marketPrice: 101.0, expectedFillPrice: 99.0, gasPrice: 33 },
  { minute: 28.5, marketPrice: 100.2, expectedFillPrice: 99.3, gasPrice: 32 },

  // At minute 29.2: Price approaches expected fill price of 99.38 - Considered starts here
  {
    minute: 29.2,
    marketPrice: 99.4,
    expectedFillPrice: 99.38,
    gasPrice: 31,
    status: 'Considered',
    isStatusChange: true,
  },

  // 30-32 min: Short Considered period
  { minute: 30, marketPrice: 98.8, expectedFillPrice: 99.4, gasPrice: 30 },
  { minute: 31.3, marketPrice: 98.2, expectedFillPrice: 99.45, gasPrice: 29 },

  // At minute 31.8: Start executing
  { minute: 31.8, marketPrice: 97.8, expectedFillPrice: 99.5, gasPrice: 28, status: 'Executing', isStatusChange: true },

  // Short Executing period
  { minute: 32.4, marketPrice: 97.4, expectedFillPrice: 99.6, gasPrice: 27 },

  // At minute 32.7: Settled
  { minute: 32.7, marketPrice: 97.0, expectedFillPrice: 99.7, gasPrice: 26, status: 'Settled', isStatusChange: true },

  // Continue showing some time after settlement
  { minute: 33.5, marketPrice: 96.8, expectedFillPrice: 99.8, gasPrice: 25 },
  { minute: 35, marketPrice: 96.7, expectedFillPrice: 99.9, gasPrice: 24 },
]

const generateDemoData = (): ChartDataPoint[] => {
  const baseTime = Date.now()

  // Interpolate between data points to get smooth transitions
  return DEMO_DATA_POINTS.flatMap((point, index) => {
    const nextPoint = DEMO_DATA_POINTS[index + 1]
    if (!nextPoint) return [createDataPoint(point, baseTime)]

    // Create points between each defined point (including the point itself)
    const points: ChartDataPoint[] = []
    for (let i = 0; i < 5; i++) {
      const progress = i / 5
      const interpolatedPoint = {
        minute: point.minute + (nextPoint.minute - point.minute) * progress,
        marketPrice: point.marketPrice + (nextPoint.marketPrice - point.marketPrice) * progress,
        expectedFillPrice: point.expectedFillPrice + (nextPoint.expectedFillPrice - point.expectedFillPrice) * progress,
        gasPrice: point.gasPrice + (nextPoint.gasPrice - point.gasPrice) * progress,
        status: point.status || getStatusForMinute(point.minute),
        // Only pass isStatusChange for the first point if it's a status change point
        isStatusChange: i === 0 ? point.isStatusChange : false,
      }
      points.push(createDataPoint(interpolatedPoint, baseTime))
    }
    return points
  })
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

// Add proper typing for the tooltip props
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
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, orderType, coordinate }) => {
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
      <div style={{ fontSize: '14px', marginBottom: '4px', color: CHART_COLORS.marketPrice }}>
        Market Price: ${data.marketPrice.toFixed(2)}
      </div>
      <div style={{ fontSize: '14px', marginBottom: '4px', color: CHART_COLORS.gasPrice }}>
        Gas Price: {data.gasPrice.toFixed(1)} Gwei
      </div>
      <div style={{ fontSize: '14px', marginBottom: '4px', color: CHART_COLORS.expectedFillPrice }}>
        Expected Fill: ${data.expectedFillPrice.toFixed(2)}
        <div style={{ fontSize: '12px', color: Color.explorer_greyShade }}>(includes gas cost impact)</div>
      </div>
      <div style={{ fontSize: '14px', marginBottom: '4px', color: CHART_COLORS.limitPrice }}>
        Limit Price: ${DEMO_LIMIT_PRICE.toFixed(2)}
      </div>
      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', marginRight: '8px' }}>Status:</span>
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

export const OrderStatusTimelineChart: React.FC<OrderStatusTimelineChartProps> = ({
  orderType = 'Market',
  height = 500,
  width,
}) => {
  const data = React.useMemo(() => generateDemoData(), [])
  const [hoveredStatus, setHoveredStatus] = React.useState<string | null>(null)

  // Filter status changes once
  const statusChanges = React.useMemo(() => data.filter((point) => point.isStatusChange), [data])

  return (
    <ChartContainer>
      <ResponsiveContainer width={width || '100%'} height={height}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
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
            domain={[97, 105]}
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
            content={<CustomTooltip orderType={orderType} />}
            position={{ x: 0, y: 0 }}
            allowEscapeViewBox={{ x: true, y: true }}
          />
          <Legend />

          {/* Add fillable area between market price and expected fill price */}
          <Area
            yAxisId="left"
            dataKey="fillableAmount"
            stroke="none"
            fill={CHART_COLORS.fillableArea}
            fillOpacity={1}
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
          {orderType === 'Market' && (
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
          {orderType === 'Limit' && (
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
            y={DEMO_LIMIT_PRICE}
            yAxisId="left"
            stroke={CHART_COLORS.limitPrice}
            strokeWidth={1}
            label={<LimitPriceLabel value={DEMO_LIMIT_PRICE} />}
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
