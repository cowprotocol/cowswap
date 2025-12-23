import { ReactNode } from 'react'

import { formatPercent } from '@cowprotocol/common-utils'
import { Loader, HoverTooltip } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import styled from 'styled-components/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { ALLOWED_PRICE_IMPACT_LOW } from '../../constants/priceImpact'

import type { DefaultTheme } from 'styled-components'

const LoaderStyled = styled(Loader)`
  margin-left: 4px;
  vertical-align: bottom;
`

const PriceImpactWrapper = styled.span<{ priceImpact$: Percent }>`
  color: ${({ theme, priceImpact$ }) => getPriceImpactColor(theme, priceImpact$)};
`

function getPriceImpactColor(theme: DefaultTheme, priceImpact: Percent): string {
  if (priceImpact.greaterThan(ALLOWED_PRICE_IMPACT_LOW)) return theme.danger

  if (priceImpact.lessThan(0)) return theme.success

  return theme.text
}

export interface PriceImpactIndicatorProps {
  isBridging?: boolean
  priceImpactParams?: PriceImpact
}

export function PriceImpactIndicator(props: PriceImpactIndicatorProps): ReactNode {
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
