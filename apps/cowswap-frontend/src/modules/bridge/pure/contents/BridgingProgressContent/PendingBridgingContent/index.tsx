import { ReactNode } from 'react'

import { BridgeStatusResult, SupportedChainId, BridgeProviderInfo } from '@cowprotocol/cow-sdk'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'

import { AnimatedEllipsis, StatusAwareText } from '../../../../styles'
import { SwapAndBridgeStatus } from '../../../../types'
import { DepositTxLink } from '../../../DepositTxLink'
import { TransactionLinkItem } from '../../../TransactionLink'

interface PendingBridgingContentProps {
  sourceChainId: SupportedChainId
  statusResult?: BridgeStatusResult
  explorerUrl?: string
  bridgeProvider?: BridgeProviderInfo
}

export function PendingBridgingContent({
  sourceChainId,
  statusResult,
  explorerUrl,
  bridgeProvider,
}: PendingBridgingContentProps): ReactNode {
  const { depositTxHash } = statusResult || {}

  return (
    <>
      <ConfirmDetailsItem
        label={
          <ReceiveAmountTitle>
            <b>You received</b>
          </ReceiveAmountTitle>
        }
      >
        <b>
          <StatusAwareText status={SwapAndBridgeStatus.PENDING}>
            in progress
            <AnimatedEllipsis isVisible />
          </StatusAwareText>
        </b>
      </ConfirmDetailsItem>
      
      {explorerUrl ? (
        <TransactionLinkItem link={explorerUrl} label="Bridge transaction" chainId={0} bridgeProvider={bridgeProvider} />
      ) : (
        <DepositTxLink depositTxHash={depositTxHash} sourceChainId={sourceChainId} />
      )}
    </>
  )
}
