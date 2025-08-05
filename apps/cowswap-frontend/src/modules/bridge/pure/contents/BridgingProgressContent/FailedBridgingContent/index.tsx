import { ReactNode } from 'react'

import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'
import { RECEIVED_LABEL } from '@cowprotocol/common-const'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { AnimatedEllipsis, DangerText, InfoTextBold, InfoTextSpan } from '../../../../styles'
import { StyledAnimatedTimelineRefundIcon } from '../../styled'

export function FailedBridgingContent(): ReactNode {
  return (
    <>
      <ConfirmDetailsItem label={RECEIVED_LABEL} withTimelineDot>
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
