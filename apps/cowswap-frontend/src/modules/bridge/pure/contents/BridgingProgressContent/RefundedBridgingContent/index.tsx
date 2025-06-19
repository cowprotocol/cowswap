import CheckmarkIcon from '@cowprotocol/assets/cow-swap/checkmark.svg'
import { ExplorerDataType, getExplorerLink, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { NetworkLogo } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { DangerText, SuccessTextBold, TimelineIconCircleWrapper } from '../../../../styles'
import { TokenAmountDisplay } from '../../../TokenAmountDisplay'
import { RefundLink, RefundRecipientWrapper, StyledTimelineCheckmarkIcon } from '../../styled'

interface RefundedContentProps {
  account: string
  bridgeSendCurrencyAmount: CurrencyAmount<Currency>
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function RefundedBridgingContent({ account, bridgeSendCurrencyAmount }: RefundedContentProps) {
  const sourceChainId = bridgeSendCurrencyAmount.currency.chainId as SupportedChainId

  return (
    <>
      <ConfirmDetailsItem label="You received" withTimelineDot>
        <DangerText>Bridging failed</DangerText>
      </ConfirmDetailsItem>
      <ConfirmDetailsItem
        label={
          <ReceiveAmountTitle
            icon={
              <TimelineIconCircleWrapper>
                <StyledTimelineCheckmarkIcon src={CheckmarkIcon} />
              </TimelineIconCircleWrapper>
            }
          >
            <SuccessTextBold>Refunded to</SuccessTextBold>
            <RefundRecipientWrapper>
              <NetworkLogo chainId={sourceChainId} size={16} />
              <b>
                <RefundLink
                  href={getExplorerLink(sourceChainId, account, ExplorerDataType.ADDRESS)}
                  target="_blank"
                  underline
                >
                  {shortenAddress(account)} ↗
                </RefundLink>
              </b>
            </RefundRecipientWrapper>
          </ReceiveAmountTitle>
        }
      >
        <b>
          <TokenAmountDisplay displaySymbol currencyAmount={bridgeSendCurrencyAmount} />
        </b>
      </ConfirmDetailsItem>
    </>
  )
}
