import { ReactNode } from 'react'
import styled from 'styled-components/macro'
import { TrendingUp } from 'react-feather'
import { Color } from '@cowprotocol/ui'

const StyledMissingChart = styled.svg`
  text {
    font-size: 12px;
    font-weight: 400;
  }
`

const StyledPath = styled.path`
  stroke: ${Color.cowfi_grey2};
`

const StyledText = styled.text`
  fill: ${({ theme }) => theme.text};
`

const StyledTrendingUp = styled(TrendingUp)`
  color: ${({ theme }) => theme.text};
`

const chartBottomPadding = 15

export function MissingPriceChart({ width, height, message }: { width: number; height: number; message: ReactNode }) {
  const midPoint = height / 2 + 45
  return (
    <StyledMissingChart data-cy="missing-chart" width={width} height={height} style={{ minWidth: '100%' }}>
      <StyledPath
        d={`M 0 ${midPoint} Q 104 ${midPoint - 70}, 208 ${midPoint} T 416 ${midPoint}
          M 416 ${midPoint} Q 520 ${midPoint - 70}, 624 ${midPoint} T 832 ${midPoint}`}
        fill="transparent"
        strokeWidth="2"
      />
      {message && <StyledTrendingUp x={0} size={12} y={height - chartBottomPadding - 10} />}
      <StyledText y={height - chartBottomPadding} x="20">
        {message}
      </StyledText>
    </StyledMissingChart>
  )
}
