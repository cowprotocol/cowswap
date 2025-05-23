import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { AnimatedEllipsis, StatusAwareText } from '../../../../styles'
import { StopStatusEnum } from '../../../../utils'

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
        <StatusAwareText status={StopStatusEnum.PENDING}>
          in progress
          <AnimatedEllipsis isVisible />
        </StatusAwareText>
      </b>
    </ConfirmDetailsItem>
  )
}
