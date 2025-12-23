import { ReactNode } from 'react'

import { formatPercent } from '@cowprotocol/common-utils'
import { Loader, HoverTooltip } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import styled from 'styled-components/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { BRIDGE_PRICE_IMPACT_THRESHOLD, PRICE_IMPACT_THRESHOLD } from '../../constants/priceImpact'

import type { DefaultTheme } from 'styled-components'

const LoaderStyled = styled(Loader)`
  margin-left: 4px;
  vertical-align: bottom;
`

const PriceImpactWrapper = styled.span<{ priceImpact$: Percent; isBridging$: boolean }>`
  color: ${({ theme, priceImpact$, isBridging$ }) => getPriceImpactColor(theme, priceImpact$, isBridging$)};
`

function getPriceImpactColor(theme: DefaultTheme, priceImpact: Percent, isBridging: boolean): string {
  const lowThreshold = (isBridging ? BRIDGE_PRICE_IMPACT_THRESHOLD : PRICE_IMPACT_THRESHOLD).low

  if (priceImpact.greaterThan(lowThreshold)) return theme.danger

  if (priceImpact.lessThan(0)) return theme.success

  return theme.text
}

export interface PriceImpactIndicatorProps {
  isBridging?: boolean
  priceImpactParams?: PriceImpact
}

export function PriceImpactIndicator({ priceImpactParams, isBridging = false }: PriceImpactIndicatorProps): ReactNode {
  const { priceImpact, loading: priceImpactLoading } = priceImpactParams || {}

  return (
    <span>
      {priceImpact ? (
        <PriceImpactWrapper priceImpact$={priceImpact} isBridging$={isBridging}>
          {' '}
          <HoverTooltip
            wrapInContainer
            content={
              isBridging
                ? t`Price impact due to liquidity levels and expected swap costs`
                : t`Price impact due to current liquidity levels`
            }
          >
            ({formatPercent(priceImpact.multiply(-1))}%)
          </HoverTooltip>
        </PriceImpactWrapper>
      ) : null}
      {priceImpactLoading && <LoaderStyled size="14px" />}
    </span>
  )
}
