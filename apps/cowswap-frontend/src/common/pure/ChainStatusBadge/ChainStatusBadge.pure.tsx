import { CSSProperties, ReactNode } from 'react'

import { SolanaVersion } from '@cowprotocol/common-const'
import { isSolanaChain, TargetChainId } from '@cowprotocol/cow-sdk'
import { Badge, BadgeType, BadgeTypes } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

export interface ChainStatusBadgeProps {
  chainId: TargetChainId
  version: SolanaVersion
  type?: BadgeType
  style?: CSSProperties
}

export function ChainStatusBadge({
  chainId,
  version,
  type = BadgeTypes.ALERT2,
  style,
}: ChainStatusBadgeProps): ReactNode {
  if (!isSolanaChain(chainId) || version === 'ga') return null

  return (
    <Badge type={type} style={style}>
      {version === 'alpha' ? <Trans>ALPHA</Trans> : <Trans>BETA</Trans>}
    </Badge>
  )
}
