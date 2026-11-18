import { ReactNode } from 'react'

import { useIsSolanaPublicLaunched } from '@cowprotocol/common-hooks'

import { ChainStatusBadge, ChainStatusBadgeProps } from 'common/pure/ChainStatusBadge/ChainStatusBadge.pure'

export type ChainStatusBadgeContainerProps = Omit<ChainStatusBadgeProps, 'isPublicLaunched'>

export function ChainStatusBadgeContainer(props: ChainStatusBadgeContainerProps): ReactNode {
  const isPublicLaunched = useIsSolanaPublicLaunched()

  return <ChainStatusBadge {...props} isPublicLaunched={isPublicLaunched} />
}
