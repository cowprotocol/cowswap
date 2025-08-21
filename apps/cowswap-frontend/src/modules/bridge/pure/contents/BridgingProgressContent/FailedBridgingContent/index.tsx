import { ReactNode } from 'react'

import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'
import { RECEIVED_LABEL } from '@cowprotocol/common-const'

import { Trans } from '@lingui/react/macro'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { AnimatedEllipsis, DangerText, InfoTextBold, InfoTextSpan } from '../../../../styles'
import { StyledAnimatedTimelineRefundIcon } from '../../styled'

export function FailedBridgingContent(): ReactNode {
  return (
    <>
      <ConfirmDetailsItem label={RECEIVED_LABEL} withTimelineDot>
        <DangerText>
          <Trans>Bridging failed</Trans>
        </DangerText>
      </ConfirmDetailsItem>
      <ConfirmDetailsItem
        label={
          <ReceiveAmountTitle icon={<StyledAnimatedTimelineRefundIcon src={RefundIcon} />}>
            <InfoTextSpan>
              <b>
                <Trans>Refunding</Trans>
              </b>
            </InfoTextSpan>
          </ReceiveAmountTitle>
        }
      >
        <InfoTextBold>
          <Trans>Refund started</Trans>
          <AnimatedEllipsis isVisible />
        </InfoTextBold>
      </ConfirmDetailsItem>
    </>
  )
}
