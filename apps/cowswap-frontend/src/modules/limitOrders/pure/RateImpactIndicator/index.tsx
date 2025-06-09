import { TokenSymbol } from '@cowprotocol/ui'
import { HoverTooltip } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'
import { Currency } from '@uniswap/sdk-core'

import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'

import { LOW_RATE_THRESHOLD_PERCENT } from 'modules/limitOrders/const/trade'

interface RateImpactProps {
  rateImpact: number
  inputCurrency: Currency | null
}

const MAX_POSITIVE_RATE_IMPACT_PERCENT = 999

const PercentBox = styled.span<{ isPositive: boolean; isTooLowRate: boolean }>`
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: ${({ isPositive, isTooLowRate }) =>
    isPositive ? `var(${UI.COLOR_SUCCESS})` : isTooLowRate ? `var(${UI.COLOR_DANGER})` : `var(${UI.COLOR_TEXT})`};
`
const ImpactTooltip = styled.span`
  display: block;
  font-size: 13px;
  padding: 5px 10px;
  max-width: 300px;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function RateImpactIndicator({ rateImpact, inputCurrency }: RateImpactProps) {
  const isPositive = rateImpact > 0
  const hugePositiveImpact = rateImpact > MAX_POSITIVE_RATE_IMPACT_PERCENT
  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT
  const displayedPercent = hugePositiveImpact ? '>' + MAX_POSITIVE_RATE_IMPACT_PERCENT : rateImpact

  if (!rateImpact) return null

  const tooltipContent = (
    <ImpactTooltip>
      {isPositive &&
        `Your order will execute when the market price is ${displayedPercent}% better than the current market price.`}
      {!isPositive && (
        <>
          This price is {displayedPercent}% lower than current market price. You could be selling your{' '}
          <TokenSymbol token={inputCurrency} /> at a loss! Click on "Market price" to set your limit price to the
          current market price.
        </>
      )}
    </ImpactTooltip>
  )

  return (
    <HoverTooltip wrapInContainer={false} content={tooltipContent} placement="bottom">
      <PercentBox isPositive={isPositive} isTooLowRate={isTooLowRate}>
        <span>
          ({isPositive && !hugePositiveImpact ? '+' : ''}
          {displayedPercent}%)
        </span>
        {isTooLowRate && <AlertTriangle size={14} />}
      </PercentBox>
    </HoverTooltip>
  )
}
