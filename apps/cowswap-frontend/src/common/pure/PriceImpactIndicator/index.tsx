import { formatPercent } from '@cowprotocol/common-utils'
import { Loader, HoverTooltip } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { t } from '@lingui/macro'
import styled from 'styled-components/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { warningSeverity } from 'legacy/utils/prices'

import type { DefaultTheme } from 'styled-components'

const LoaderStyled = styled(Loader)`
  margin-left: 4px;
  vertical-align: bottom;
`

export interface PriceImpactIndicatorProps {
  priceImpactParams?: PriceImpact
}

function getPriceImpactColor(theme: DefaultTheme, priceImpact: Percent): string {
  const severity = warningSeverity(priceImpact)

  if (severity === -1) return theme.success
  if (severity < 1) return theme.text
  if (severity < 3) return theme.danger

  return theme.danger
}

const PriceImpactWrapper = styled.span<{ priceImpact$: Percent }>`
  color: ${({ theme, priceImpact$ }) => getPriceImpactColor(theme, priceImpact$)};
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PriceImpactIndicator(props: PriceImpactIndicatorProps) {
  const { priceImpact, loading: priceImpactLoading } = props.priceImpactParams || {}

  return (
    <span>
      {priceImpact ? (
        <PriceImpactWrapper priceImpact$={priceImpact}>
          {' '}
          <HoverTooltip wrapInContainer content={t`Price impact due to current liquidity levels`}>
            ({formatPercent(priceImpact.multiply(-1))}%)
          </HoverTooltip>
        </PriceImpactWrapper>
      ) : null}
      {priceImpactLoading && <LoaderStyled size="14px" />}
    </span>
  )
}
