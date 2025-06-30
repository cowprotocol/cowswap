import { ReactNode } from 'react'

import ReceiptIcon from '@cowprotocol/assets/cow-swap/icon-receipt.svg'
import { getChainInfo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { BridgeStatusResult, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

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
  chainId: number
}

function TransactionLink({ link, label, chainId }: TransactionLinkProps): ReactNode {
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()
  const bridgeNetwork = bridgeSupportedNetworks?.find((network) => network.id === chainId)

  const explorerTitle = bridgeNetwork?.blockExplorer.name || getChainInfo(chainId)?.explorerTitle || 'Explorer'

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
      <ExternalLink href={link}>View on {explorerTitle} ↗</ExternalLink>
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
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()
  const destinationBridgeNetwork = bridgeSupportedNetworks?.find((network) => network.id === destinationChainId)

  const depositLink = depositTxHash && getExplorerLink(sourceChainId, depositTxHash, ExplorerDataType.TRANSACTION)
  const blockExplorerUrl = destinationBridgeNetwork?.blockExplorer?.url || getChainInfo(destinationChainId)?.explorer

  const fillTxLink =
    fillTxHash &&
    blockExplorerUrl &&
    getExplorerLink(destinationChainId, fillTxHash, ExplorerDataType.TRANSACTION, blockExplorerUrl)

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

      {depositLink && <TransactionLink link={depositLink} label="Source transaction" chainId={sourceChainId} />}
      {fillTxLink && <TransactionLink link={fillTxLink} label="Destination transaction" chainId={destinationChainId} />}
    </>
  )
}
