import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { AnimatedEllipsis, StatusAwareText } from '../../../../styles'
import { SwapAndBridgeStatus } from '../../../../types'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PendingBridgingContent() {
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
