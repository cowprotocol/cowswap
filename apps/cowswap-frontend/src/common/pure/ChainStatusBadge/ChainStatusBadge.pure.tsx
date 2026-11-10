import { CSSProperties, ReactNode } from 'react'

import { isSolanaChain, TargetChainId } from '@cowprotocol/cow-sdk'
import { Badge, BadgeType, BadgeTypes } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

export interface ChainStatusBadgeProps {
  chainId: TargetChainId
  isBeta: boolean
  type?: BadgeType
  style?: CSSProperties
}

export function ChainStatusBadge({
  chainId,
  isBeta,
  type = BadgeTypes.ALERT2,
  style,
}: ChainStatusBadgeProps): ReactNode {
  if (!isSolanaChain(chainId)) return null

  return (
    <Badge type={type} style={style}>
      {isBeta ? <Trans>BETA</Trans> : <Trans>ALPHA</Trans>}
    </Badge>
  )
}
