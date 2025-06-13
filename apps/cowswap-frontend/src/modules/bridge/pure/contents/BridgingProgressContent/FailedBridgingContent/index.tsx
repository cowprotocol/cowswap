import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { AnimatedEllipsis, DangerText, InfoTextBold, InfoTextSpan } from '../../../../styles'
import { StyledAnimatedTimelineRefundIcon } from '../../styled'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
