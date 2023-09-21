import { formatPercent } from '@cowprotocol/common-utils'
import { Loader } from '@cowprotocol/ui'
import { MouseoverTooltip } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { t } from '@lingui/macro'
import styled, { DefaultTheme } from 'styled-components/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { warningSeverity } from 'legacy/utils/prices'

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
          <MouseoverTooltip text={t`Price impact due to current liquidity levels`}>
            ({formatPercent(priceImpact.multiply(-1))}%)
          </MouseoverTooltip>
        </PriceImpactWrapper>
      ) : null}
      {priceImpactLoading && <Loader size="14px" style={{ margin: '0 0 -2px 7px' }} />}
    </span>
  )
}
