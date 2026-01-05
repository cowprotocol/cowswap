import { ReactNode } from 'react'

import { RECEIVED_LABEL } from '@cowprotocol/common-const'

import { Trans, useLingui } from '@lingui/react/macro'
import RefundIcon from 'assets/cow-swap/icon-refund.svg'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { AnimatedEllipsis, DangerText, InfoTextBold, InfoTextSpan } from '../../../../styles'
import { StyledAnimatedTimelineRefundIcon } from '../../styled'

export function FailedBridgingContent(): ReactNode {
  const { i18n } = useLingui()

  return (
    <>
      <ConfirmDetailsItem label={i18n._(RECEIVED_LABEL)} withTimelineDot>
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
