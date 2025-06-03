import InfoIcon from '@cowprotocol/assets/cow-swap/info.svg'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { BridgeStatusResult, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { StyledTimelineInfoIcon, SuccessTextBold, TimelineIconCircleWrapper } from '../../../../styles'
import { TokenAmountDisplay } from '../../../TokenAmountDisplay'

interface ReceivedBridgingContentProps {
  statusResult?: BridgeStatusResult
  sourceChainId: SupportedChainId
  destinationChainId: number
  receivedAmount: CurrencyAmount<Currency>
  receivedAmountUsd: CurrencyAmount<Token> | null | undefined
}

export function ReceivedBridgingContent({
  statusResult,
  receivedAmountUsd,
  receivedAmount,
  sourceChainId,
  destinationChainId,
}: ReceivedBridgingContentProps) {
  const { depositTxHash, fillTxHash } = statusResult || {}

  const depositLink = depositTxHash && getExplorerLink(sourceChainId, depositTxHash, ExplorerDataType.TRANSACTION)
  const fillTxLink =
    fillTxHash &&
    destinationChainId in SupportedChainId &&
    getExplorerLink(destinationChainId, fillTxHash, ExplorerDataType.TRANSACTION)

  return (
    <>
      <ConfirmDetailsItem
        label={
          <ReceiveAmountTitle variant="success">
            <SuccessTextBold>You received</SuccessTextBold>
          </ReceiveAmountTitle>
        }
      >
        <b>
          <TokenAmountDisplay displaySymbol currencyAmount={receivedAmount} usdValue={receivedAmountUsd} />
        </b>
      </ConfirmDetailsItem>

      {depositLink && (
        <ConfirmDetailsItem
          label={
            <>
              <TimelineIconCircleWrapper padding="0" bgColor={'transparent'}>
                <StyledTimelineInfoIcon src={InfoIcon} />
              </TimelineIconCircleWrapper>{' '}
              Source transaction
            </>
          }
        >
          <ExternalLink href={depositLink}>View on Explorer ↗</ExternalLink>
        </ConfirmDetailsItem>
      )}
      {fillTxLink && (
        <ConfirmDetailsItem
          label={
            <>
              <TimelineIconCircleWrapper padding="0" bgColor={'transparent'}>
                <StyledTimelineInfoIcon src={InfoIcon} />
              </TimelineIconCircleWrapper>{' '}
              Destination transaction
            </>
          }
        >
          <ExternalLink href={fillTxLink}>View on Explorer ↗</ExternalLink>
        </ConfirmDetailsItem>
      )}
    </>
  )
}
