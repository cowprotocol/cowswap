import { CSSProperties, ReactNode } from 'react'

import { isSolanaChain, TargetChainId } from '@cowprotocol/cow-sdk'
import { Badge, BadgeType, BadgeTypes } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

export interface ChainStatusBadgeProps {
  chainId: TargetChainId
  type?: BadgeType
  style?: CSSProperties
}

/**
 * Marks a chain whose deployment is not yet audited. The only place that decides which chains those
 * are, so every selector loses the label in one edit once Solana leaves alpha — and none of them can
 * be forgotten in the meantime. Renders nothing for an audited chain.
 */
export function ChainStatusBadge({ chainId, type = BadgeTypes.ALERT2, style }: ChainStatusBadgeProps): ReactNode {
  if (!isSolanaChain(chainId)) return null

  return (
    <Badge type={type} style={style}>
      <Trans>ALPHA</Trans>
    </Badge>
  )
}
