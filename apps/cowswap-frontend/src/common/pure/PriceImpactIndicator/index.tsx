import { ReactNode } from 'react'

import { formatPercent } from '@cowprotocol/common-utils'
import { Loader, HoverTooltip } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import styled from 'styled-components/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { PRICE_IMPACT_TIERS } from 'common/constants/priceImpact'

import type { DefaultTheme } from 'styled-components'

const LoaderStyled = styled(Loader)`
  margin-left: 4px;
  vertical-align: bottom;
`

type WarningSeverity = -1 | 0 | 1 | 2 | 3 | 4

function warningSeverity(priceImpact: Percent | undefined): WarningSeverity {
  if (!priceImpact) return 4
  if (priceImpact.lessThan(0)) return -1

  let impact: WarningSeverity = PRICE_IMPACT_TIERS.length as WarningSeverity
  for (const impactLevel of PRICE_IMPACT_TIERS) {
    if (impactLevel.lessThan(priceImpact)) return impact
    impact--
  }
  return 0
}

export interface PriceImpactIndicatorProps {
  isBridging?: boolean
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
