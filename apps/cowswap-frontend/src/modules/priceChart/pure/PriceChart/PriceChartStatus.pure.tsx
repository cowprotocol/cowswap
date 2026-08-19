import { ReactNode } from 'react'

import { Loader } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import type { PriceChartHistoryStatus } from '../../lib/tradingView.types'

type PriceChartStatusKind = Extract<PriceChartHistoryStatus, 'loading' | 'empty' | 'error'>

interface PriceChartStatusProps {
  assetSymbol?: string
  kind: PriceChartStatusKind
}

export function PriceChartStatus({ assetSymbol = 'TOKEN', kind }: PriceChartStatusProps): ReactNode {
  if (kind === 'loading') {
    return <Loader aria-label={t`Loading price history for ${assetSymbol}`} role="status" size="32px" />
  }

  if (kind === 'empty') {
    return <Trans>Failed to load price history for {assetSymbol}</Trans>
  }

  if (kind === 'error') {
    return <Trans>Service unavailable</Trans>
  }

  return null
}
