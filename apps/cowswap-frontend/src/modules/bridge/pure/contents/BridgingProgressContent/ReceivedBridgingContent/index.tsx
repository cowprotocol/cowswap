import { ReactNode } from 'react'

import ReceiptIcon from '@cowprotocol/assets/cow-swap/icon-receipt.svg'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { BridgeStatusResult, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { StyledTimelineReceiptIcon, SuccessTextBold, TimelineIconCircleWrapper } from '../../../../styles'
import { TokenAmountDisplay } from '../../../TokenAmountDisplay'

interface ReceivedBridgingContentProps {
  statusResult?: BridgeStatusResult
  sourceChainId: SupportedChainId
  destinationChainId: number
  receivedAmount: CurrencyAmount<Currency>
  receivedAmountUsd: CurrencyAmount<Token> | null | undefined
}

interface TransactionLinkProps {
  link: string
  label: string
}

function TransactionLink({ link, label }: TransactionLinkProps): ReactNode {
  return (
    <ConfirmDetailsItem
      label={
        <>
          <TimelineIconCircleWrapper padding="0" bgColor={'transparent'}>
            <StyledTimelineReceiptIcon src={ReceiptIcon} />
          </TimelineIconCircleWrapper>{' '}
          {label}
        </>
      }
    >
      <ExternalLink href={link}>View on bridge explorer ↗</ExternalLink>
    </ConfirmDetailsItem>
  )
}

export function ReceivedBridgingContent({
  statusResult,
  receivedAmountUsd,
  receivedAmount,
  sourceChainId,
  destinationChainId,
}: ReceivedBridgingContentProps): ReactNode {
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

      {depositLink && <TransactionLink link={depositLink} label="Source transaction" />}
      {fillTxLink && <TransactionLink link={fillTxLink} label="Destination transaction" />}
    </>
  )
}
