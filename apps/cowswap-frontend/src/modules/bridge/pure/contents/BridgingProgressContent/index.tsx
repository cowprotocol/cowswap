import { ReactNode } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { BridgeStatusResult } from '@cowprotocol/sdk-bridging'

import { FailedBridgingContent } from './FailedBridgingContent'
import { PendingBridgingContent } from './PendingBridgingContent'
import { ReceivedBridgingContent } from './ReceivedBridgingContent'
import { RefundedBridgingContent } from './RefundedBridgingContent'

import { BridgingProgressContext } from '../../../types'
import { QuoteBridgeContent, QuoteBridgeContentProps } from '../QuoteBridgeContent'

interface BridgingContentProps extends QuoteBridgeContentProps {
  progressContext: BridgingProgressContext
  statusResult?: BridgeStatusResult
  explorerUrl?: string
}

export function BridgingProgressContent(props: BridgingContentProps): ReactNode {
  const {
    progressContext: {
      account,
      sourceChainId,
      destinationChainId,
      receivedAmount,
      receivedAmountUsd,
      isFailed,
      isRefunded,
    },
    quoteContext,
    statusResult,
    explorerUrl,
  } = props

  return (
    <QuoteBridgeContent {...props} isFinished={!isFractionFalsy(receivedAmount)}>
      {receivedAmount ? (
        <ReceivedBridgingContent
          statusResult={statusResult}
          sourceChainId={sourceChainId}
          destinationChainId={destinationChainId}
          receivedAmount={receivedAmount}
          receivedAmountUsd={receivedAmountUsd}
          explorerUrl={explorerUrl}
        />
      ) : isRefunded ? (
        <RefundedBridgingContent account={account} bridgeSendCurrencyAmount={quoteContext.sellAmount} />
      ) : isFailed ? (
        <FailedBridgingContent />
      ) : (
        <PendingBridgingContent sourceChainId={sourceChainId} statusResult={statusResult} explorerUrl={explorerUrl} />
      )}
    </QuoteBridgeContent>
  )
}
