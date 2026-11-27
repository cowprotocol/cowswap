import { CSSProperties, ReactNode } from 'react'

import { TargetChainId } from '@cowprotocol/cow-sdk'
import { Badge, BadgeType, BadgeTypes } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { NEW_NETWORK_IDS } from './ChainStatusBadge.constants'

export interface ChainStatusBadgeProps {
  chainId: TargetChainId
  type?: BadgeType
  style?: CSSProperties
}

export function ChainStatusBadge({ chainId, type = BadgeTypes.ALERT2, style }: ChainStatusBadgeProps): ReactNode {
  if (!NEW_NETWORK_IDS.has(chainId)) return null

  return (
    <Badge type={type} style={style}>
      <Trans>NEW</Trans>
    </Badge>
  )
}
