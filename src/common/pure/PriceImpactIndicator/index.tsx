import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import styled, { DefaultTheme } from 'styled-components/macro'
import { Percent } from '@uniswap/sdk-core'
import { warningSeverity } from 'legacy/utils/prices'
import { MouseoverTooltip } from 'legacy/components/Tooltip'
import { t } from '@lingui/macro'
import { formatPercent } from 'utils/amountFormat'
import Loader from 'legacy/components/Loader'

export interface PriceImpactIndicatorProps {
  priceImpactParams?: PriceImpact
}

function getPriceImpactColor(theme: DefaultTheme, priceImpact: Percent): string {
  const severity = warningSeverity(priceImpact)

  if (severity === -1) return theme.success
  if (severity < 1) return theme.text1
  if (severity < 3) return theme.danger

  return theme.red1
}

const PriceImpactWrapper = styled.span<{ priceImpact$: Percent }>`
  color: ${({ theme, priceImpact$ }) => getPriceImpactColor(theme, priceImpact$)};
`

export function PriceImpactIndicator(props: PriceImpactIndicatorProps) {
  const { priceImpact, loading: priceImpactLoading } = props.priceImpactParams || {}

  return (
    <span>
      {priceImpact ? (
        <PriceImpactWrapper priceImpact$={priceImpact}>
          {' '}
          <MouseoverTooltip text={t`The estimated difference between the USD values of input and output amounts.`}>
            ({formatPercent(priceImpact.multiply(-1))}%)
          </MouseoverTooltip>
        </PriceImpactWrapper>
      ) : null}
      {priceImpactLoading && <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />}
    </span>
  )
}
