import { ReactNode } from 'react'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { AnimatedEllipsis, StatusAwareText } from '../../../../styles'
import { SwapAndBridgeStatus } from '../../../../types'

export function PendingBridgingContent(): ReactNode {
  return (
    <ConfirmDetailsItem
      label={
        <ReceiveAmountTitle>
          <b>You received</b>
        </ReceiveAmountTitle>
      }
    >
      <b>
        <StatusAwareText status={SwapAndBridgeStatus.PENDING}>
          in progress
          <AnimatedEllipsis isVisible />
        </StatusAwareText>
      </b>
    </ConfirmDetailsItem>
  )
}
