import { ReactNode } from 'react'

import { Trans } from '@lingui/macro'

import { useIsRowRewardsVisible } from '../../hooks/useIsRowRewardsVisible'
import { RowRewardsContent } from '../../pure/Row/RowRewards'

export function RowRewards(): ReactNode {
  const isRowRewardsVisible = useIsRowRewardsVisible()
  const tooltipContent = <Trans>Earn more by adding a referral code.</Trans>

  if (!isRowRewardsVisible) {
    return null
  }

  return <RowRewardsContent tooltipContent={tooltipContent} />
}
