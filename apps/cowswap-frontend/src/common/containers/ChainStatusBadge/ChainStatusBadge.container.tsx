import { ReactNode } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { ChainStatusBadge, ChainStatusBadgeProps } from 'common/pure/ChainStatusBadge/ChainStatusBadge.pure'

export type ChainStatusBadgeContainerProps = Omit<ChainStatusBadgeProps, 'isBeta'>

export function ChainStatusBadgeContainer(props: ChainStatusBadgeContainerProps): ReactNode {
  const { isSolanaBeta } = useFeatureFlags()

  return <ChainStatusBadge {...props} isBeta={!!isSolanaBeta} />
}
