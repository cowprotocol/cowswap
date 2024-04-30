import { ReactNode } from 'react'
import styled from 'styled-components'
import { Color } from 'styles/variables'
import { TrendingUp } from 'react-feather'

const StyledMissingChart = styled.svg`
  text {
    font-size: 12px;
    font-weight: 400;
  }
`

const chartBottomPadding = 15

export function MissingPriceChart({ width, height, message }: { width: number; height: number; message: ReactNode }) {
  const midPoint = height / 2 + 45
  return (
    <StyledMissingChart data-cy="missing-chart" width={width} height={height} style={{ minWidth: '100%' }}>
      <path
        d={`M 0 ${midPoint} Q 104 ${midPoint - 70}, 208 ${midPoint} T 416 ${midPoint}
          M 416 ${midPoint} Q 520 ${midPoint - 70}, 624 ${midPoint} T 832 ${midPoint}`}
        stroke={Color.grey2}
        fill="transparent"
        strokeWidth="2"
      />
      {message && <TrendingUp stroke={Color.text1} x={0} size={12} y={height - chartBottomPadding - 10} />}
      <text y={height - chartBottomPadding} x="20" fill={Color.text1}>
        {message}
      </text>
    </StyledMissingChart>
  )
}
