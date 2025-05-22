import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { AnimatedEllipsis, DangerText, InfoTextBold, InfoTextSpan } from '../../styles'
import { StyledAnimatedTimelineRefundIcon } from '../BridgeStopDetails/styled'

export function FailedBridgingContent() {
  return (
    <>
      <ConfirmDetailsItem label="You received" withTimelineDot={true}>
        <DangerText>Bridging failed</DangerText>
      </ConfirmDetailsItem>
      <ConfirmDetailsItem
        label={
          <ReceiveAmountTitle icon={<StyledAnimatedTimelineRefundIcon src={RefundIcon} />}>
            <InfoTextSpan>
              <b>Refunding</b>
            </InfoTextSpan>
          </ReceiveAmountTitle>
        }
      >
        <InfoTextBold>
          Refund started
          <AnimatedEllipsis isVisible />
        </InfoTextBold>
      </ConfirmDetailsItem>
    </>
  )
}
