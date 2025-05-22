import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { FailedBridgingContent } from '../FailedBridgingContent'
import { PendingBridgingContent } from '../PendingBridgingContent'
import { QuoteBridgeContent, QuoteBridgeContentProps } from '../QuoteBridgeContent'
import { ReceivedBridgingContent } from '../ReceivedBridgingContent'
import { RefundedContent } from '../RefundedContent'

interface BridgingContentProps extends QuoteBridgeContentProps {
  isFailed?: boolean
  isRefunded?: boolean

  account: string
  bridgeSendCurrencyAmount: CurrencyAmount<Currency>
  receivedAmount?: CurrencyAmount<Currency>
  receivedAmountUsd?: CurrencyAmount<Token> | null
}

export function BridgingContent(props: BridgingContentProps) {
  const { account, receivedAmount, receivedAmountUsd, bridgeSendCurrencyAmount, isFailed, isRefunded } = props

  return (
    <QuoteBridgeContent {...props}>
      {receivedAmount ? (
        <ReceivedBridgingContent receivedAmount={receivedAmount} receivedAmountUsd={receivedAmountUsd} />
      ) : isRefunded ? (
        <RefundedContent account={account} bridgeSendCurrencyAmount={bridgeSendCurrencyAmount} />
      ) : isFailed ? (
        <FailedBridgingContent />
      ) : (
        <PendingBridgingContent />
      )}
    </QuoteBridgeContent>
  )
}
