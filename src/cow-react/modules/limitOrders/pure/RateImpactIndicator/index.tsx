import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'
import { MouseoverTooltipContent } from 'components/Tooltip'
import { LOW_RATE_THRESHOLD_PERCENT } from '@cow/modules/limitOrders/const/trade'

interface RateImpactProps {
  rateImpact: number
}

const MAX_POSITIVE_RATE_IMPACT_PERCENT = 999

const PercentBox = styled.span<{ isPositive: boolean; isTooLowRate: boolean }>`
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  color: ${({ isPositive, isTooLowRate }) => (isPositive ? 'green' : isTooLowRate ? 'red' : 'grey')};

  svg {
    margin-left: 5px;
  }
`
const ImpactTooltip = styled.span`
  padding: 5px 10px;
`

export function RateImpactIndicator({ rateImpact }: RateImpactProps) {
  const isPositive = rateImpact > 0
  const hugePositiveImpact = rateImpact > MAX_POSITIVE_RATE_IMPACT_PERCENT
  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT

  if (!rateImpact) return null

  const tooltipContent = <ImpactTooltip>TODO: explain rate impact</ImpactTooltip>

  return (
    <MouseoverTooltipContent wrap={false} content={tooltipContent} disableHover={!isTooLowRate} placement="bottom">
      <PercentBox isPositive={isPositive} isTooLowRate={isTooLowRate}>
        <span>
          ({isPositive && !hugePositiveImpact ? '+' : ''}
          {hugePositiveImpact ? '>' + MAX_POSITIVE_RATE_IMPACT_PERCENT : rateImpact}%)
        </span>
        {isTooLowRate && <AlertTriangle size={14} />}
      </PercentBox>
    </MouseoverTooltipContent>
  )
}
