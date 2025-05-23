import { FailedBridgingContent } from './FailedBridgingContent'
import { PendingBridgingContent } from './PendingBridgingContent'
import { ReceivedBridgingContent } from './ReceivedBridgingContent'
import { RefundedBridgingContent } from './RefundedBridgingContent'

import { BridgingProgressContext } from '../../../types'
import { QuoteBridgeContent, QuoteBridgeContentProps } from '../QuoteBridgeContent'

interface BridgingContentProps extends QuoteBridgeContentProps {
  progressContext: BridgingProgressContext
}

export function BridgingProgressContent(props: BridgingContentProps) {
  const {
    progressContext: { account, receivedAmount, receivedAmountUsd, isFailed, isRefunded },
    quoteContext,
  } = props

  return (
    <QuoteBridgeContent {...props}>
      {receivedAmount ? (
        <ReceivedBridgingContent receivedAmount={receivedAmount} receivedAmountUsd={receivedAmountUsd} />
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
