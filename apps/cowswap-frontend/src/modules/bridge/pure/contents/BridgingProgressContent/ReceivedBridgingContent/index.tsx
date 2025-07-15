import { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { BridgeStatusResult, SupportedChainId, BridgeProviderInfo } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { SuccessTextBold } from '../../../../styles'
import { DepositTxLink } from '../../../DepositTxLink'
import { TokenAmountDisplay } from '../../../TokenAmountDisplay'
import { TransactionLinkItem } from '../../../TransactionLink'

interface ReceivedBridgingContentProps {
  statusResult?: BridgeStatusResult
  sourceChainId: SupportedChainId
  destinationChainId: number
  receivedAmount: CurrencyAmount<Currency>
  receivedAmountUsd: CurrencyAmount<Token> | null | undefined
  explorerUrl?: string
  bridgeProvider?: BridgeProviderInfo
}

export function ReceivedBridgingContent({
  statusResult,
  receivedAmountUsd,
  receivedAmount,
  sourceChainId,
  destinationChainId,
  explorerUrl,
  bridgeProvider,
}: ReceivedBridgingContentProps): ReactNode {
  const { depositTxHash, fillTxHash } = statusResult || {}
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()
  const destinationBridgeNetwork = bridgeSupportedNetworks?.find((network) => network.id === destinationChainId)

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

      {explorerUrl ? (
        <TransactionLinkItem
          link={explorerUrl}
          label="Bridge transaction"
          chainId={0}
          bridgeProvider={bridgeProvider}
        />
      ) : (
        <>
          <DepositTxLink depositTxHash={depositTxHash} sourceChainId={sourceChainId} />
          {fillTxLink && (
            <TransactionLinkItem link={fillTxLink} label="Destination transaction" chainId={destinationChainId} />
          )}
        </>
      )}
    </>
  )
}
