import { ReactNode } from 'react'

import { Trans } from '@lingui/react/macro'

import type { PriceChartHistoryStatus } from '../../lib/tradingView.types'

type PriceChartStatusKind = Extract<PriceChartHistoryStatus, 'loading' | 'empty' | 'error'>

interface PriceChartStatusProps {
  assetSymbol?: string
  kind: PriceChartStatusKind
}

export function PriceChartStatus({ assetSymbol = 'TOKEN', kind }: PriceChartStatusProps): ReactNode {
  if (kind === 'loading') {
    return <Trans>Loading price history for {assetSymbol}</Trans>
  }

  if (kind === 'empty') {
    return <Trans>Failed to load price history for {assetSymbol}</Trans>
  }

  if (kind === 'error') {
    return <Trans>Service unavailable</Trans>
  }

  return null
}
