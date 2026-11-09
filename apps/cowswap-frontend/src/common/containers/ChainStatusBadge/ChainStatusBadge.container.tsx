import { ReactNode } from 'react'

import { useSolanaVersion } from '@cowprotocol/common-hooks'

import { ChainStatusBadge, ChainStatusBadgeProps } from 'common/pure/ChainStatusBadge/ChainStatusBadge.pure'

export type ChainStatusBadgeContainerProps = Omit<ChainStatusBadgeProps, 'version'>

export function ChainStatusBadgeContainer(props: ChainStatusBadgeContainerProps): ReactNode {
  const version = useSolanaVersion()

  return <ChainStatusBadge {...props} version={version} />
}
