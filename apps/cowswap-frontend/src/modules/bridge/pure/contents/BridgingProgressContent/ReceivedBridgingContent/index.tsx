import { ReactNode } from 'react'

import { getChainInfo, RECEIVED_LABEL } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeStatusResult } from '@cowprotocol/sdk-bridging'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { getChainType } from 'common/chains/nonEvm'

import { SuccessTextBold } from '../../../../styles'
import { BridgeTransactionLink } from '../../../BridgeTransactionLink'
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
}

export function ReceivedBridgingContent({
  statusResult,
  receivedAmountUsd,
  receivedAmount,
  sourceChainId,
  destinationChainId,
  explorerUrl,
}: ReceivedBridgingContentProps): ReactNode {
  const { depositTxHash, fillTxHash } = statusResult || {}
  const destinationBridgeNetwork = useBridgeSupportedNetwork(destinationChainId)
  const { i18n } = useLingui()
  const destinationChainType = getChainType(destinationChainId)
  const isEvmDestination = destinationChainType === 'evm' && destinationChainId in SupportedChainId

  // Only show explorer links for EVM destinations. Non-EVM explorers need different URL formats.
  const blockExplorerUrl = isEvmDestination
    ? destinationBridgeNetwork?.blockExplorer?.url || getChainInfo(destinationChainId as SupportedChainId).explorer
    : undefined

  const fillTxLink =
    fillTxHash &&
    blockExplorerUrl &&
    getExplorerLink(destinationChainId, fillTxHash, ExplorerDataType.TRANSACTION, blockExplorerUrl)

  return (
    <>
      <ConfirmDetailsItem
        label={
          <ReceiveAmountTitle variant="success">
            <SuccessTextBold>{i18n._(RECEIVED_LABEL)}</SuccessTextBold>
          </ReceiveAmountTitle>
        }
      >
        <b>
          <TokenAmountDisplay displaySymbol currencyAmount={receivedAmount} usdValue={receivedAmountUsd} />
        </b>
      </ConfirmDetailsItem>

      {explorerUrl ? (
        <BridgeTransactionLink link={explorerUrl} label={t`Bridge transaction`} />
      ) : (
        <>
          <DepositTxLink depositTxHash={depositTxHash} sourceChainId={sourceChainId} />
          {isEvmDestination && fillTxLink && (
            <TransactionLinkItem link={fillTxLink} label={t`Destination transaction`} chainId={destinationChainId} />
          )}
        </>
      )}
    </>
  )
}
