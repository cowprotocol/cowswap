import { ReactNode } from 'react'

import { BridgeStatusResult } from '@cowprotocol/cow-sdk'

import { FailedBridgingContent } from './FailedBridgingContent'
import { PendingBridgingContent } from './PendingBridgingContent'
import { ReceivedBridgingContent } from './ReceivedBridgingContent'
import { RefundedBridgingContent } from './RefundedBridgingContent'

import { BridgingProgressContext } from '../../../types'
import { QuoteBridgeContent, QuoteBridgeContentProps } from '../QuoteBridgeContent'

interface BridgingContentProps extends QuoteBridgeContentProps {
  progressContext: BridgingProgressContext
  statusResult?: BridgeStatusResult
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
  } = props

  return (
    <QuoteBridgeContent {...props}>
      {receivedAmount ? (
        <ReceivedBridgingContent
          statusResult={statusResult}
          sourceChainId={sourceChainId}
          destinationChainId={destinationChainId}
          receivedAmount={receivedAmount}
          receivedAmountUsd={receivedAmountUsd}
        />
      ) : isRefunded ? (
        <RefundedBridgingContent account={account} bridgeSendCurrencyAmount={quoteContext.sellAmount} />
      ) : isFailed ? (
        <FailedBridgingContent />
      ) : (
        <PendingBridgingContent />
      )}
    </QuoteBridgeContent>
  )
}
