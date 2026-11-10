import { ReactNode } from 'react'

import { useIsSolanaBeta } from '@cowprotocol/common-hooks'

import { ChainStatusBadge, ChainStatusBadgeProps } from 'common/pure/ChainStatusBadge/ChainStatusBadge.pure'

export type ChainStatusBadgeContainerProps = Omit<ChainStatusBadgeProps, 'isBeta'>

export function ChainStatusBadgeContainer(props: ChainStatusBadgeContainerProps): ReactNode {
  const isBeta = useIsSolanaBeta()

  return <ChainStatusBadge {...props} isBeta={isBeta} />
}
