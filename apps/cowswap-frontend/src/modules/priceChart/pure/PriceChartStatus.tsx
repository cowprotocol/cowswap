import { ReactNode } from 'react'

import { Loader } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { FALLBACK_TOKEN_SYMBOL } from '../lib/priceChart.constants'

interface PriceChartStatusProps {
  assetSymbol?: string
  isPending: boolean
  isError: boolean
}

export function PriceChartStatus({
  assetSymbol = FALLBACK_TOKEN_SYMBOL,
  isPending,
  isError,
}: PriceChartStatusProps): ReactNode {
  if (isPending) {
    return <Loader aria-label={t`Loading price history for ${assetSymbol}`} role="status" size="32px" />
  }

  if (isError) {
    return <Trans>Service unavailable</Trans>
  }

  return <Trans>Failed to load price history for {assetSymbol}</Trans>
}
