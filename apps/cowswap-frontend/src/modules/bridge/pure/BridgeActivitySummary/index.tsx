import { ReactNode, memo } from 'react'

import { TokenAmount, FiatAmount } from '@cowprotocol/ui'
import type { Currency } from '@uniswap/sdk-core'

import { ShimmerWrapper, SummaryRow } from 'common/pure/OrderSummaryRow'

import { BridgeStepRow } from './BridgeStepRow'
import { BridgeSummaryHeader } from './BridgeSummaryHeader'
import { FiatWrapper } from './styled'
import { SwapStepRow } from './SwapStepRow'

import { SwapAndBridgeContext } from '../../types'
import { RecipientDisplay } from '../RecipientDisplay'

interface BridgeActivitySummaryProps {
  context: SwapAndBridgeContext
  children: ReactNode
  fulfillmentTime?: string
  isCustomRecipient?: boolean
  receiverEnsName?: string | null
}

const BridgeMetaDetails = memo(function BridgeMetaDetails({
  surplusAmount,
  surplusAmountUsd,
  sourceToken,
  fulfillmentTime,
  isCustomRecipient,
  quoteBridgeContext,
  targetToken,
}: {
  surplusAmount: SwapAndBridgeContext['swapResultContext']['surplusAmount']
  surplusAmountUsd: SwapAndBridgeContext['swapResultContext']['surplusAmountUsd']
  sourceToken: Currency
  fulfillmentTime?: string
  isCustomRecipient?: boolean
  receiverEnsName?: string | null
  quoteBridgeContext?: SwapAndBridgeContext['quoteBridgeContext']
  targetToken: Currency
}): ReactNode {
  return (
    <>
      {/* Surplus Section */}
      {surplusAmount?.greaterThan(0) && (
        <SummaryRow>
          <b>Surplus</b>
          <i>
            <TokenAmount amount={surplusAmount} tokenSymbol={sourceToken} />
            {surplusAmountUsd && (
              <FiatWrapper>
                (<FiatAmount amount={surplusAmountUsd} />)
              </FiatWrapper>
            )}
          </i>
        </SummaryRow>
      )}

      {/* Filled on Section */}
      {fulfillmentTime && (
        <SummaryRow>
          <b>Filled on</b>
          <i>{fulfillmentTime}</i>
        </SummaryRow>
      )}

      {/* Recipient Section - Always show for custom recipients, with shimmer if loading */}
      {isCustomRecipient && (
        <SummaryRow>
          <b>Recipient</b>
          <i>
            {quoteBridgeContext?.recipient ? (
              <RecipientDisplay recipient={quoteBridgeContext.recipient} chainId={targetToken.chainId} logoSize={16} />
            ) : (
              <ShimmerWrapper />
            )}
          </i>
        </SummaryRow>
      )}
    </>
  )
})

export function BridgeActivitySummary(props: BridgeActivitySummaryProps): ReactNode {
  const { context, fulfillmentTime, isCustomRecipient, receiverEnsName, children } = props

  // Additional validation for required data
  const { overview, swapResultContext } = context
  const { sourceAmounts, targetCurrency } = overview

  const { quoteBridgeContext } = context

  const { targetAmounts, sourceChainName, targetChainName } = overview
  const { surplusAmount, surplusAmountUsd } = swapResultContext

  // Get tokens for display
  const sourceToken = sourceAmounts.buyAmount.currency // intermediate token after swap
  const targetToken = targetCurrency

  return (
    <>
      <BridgeSummaryHeader
        sourceAmounts={sourceAmounts}
        targetAmounts={targetAmounts}
        sourceChainName={sourceChainName}
        targetChainName={targetChainName}
      />

      <SwapStepRow context={context} />

      <BridgeStepRow context={context} />

      <BridgeMetaDetails
        surplusAmount={surplusAmount}
        surplusAmountUsd={surplusAmountUsd}
        sourceToken={sourceToken}
        fulfillmentTime={fulfillmentTime}
        isCustomRecipient={isCustomRecipient}
        receiverEnsName={receiverEnsName}
        quoteBridgeContext={quoteBridgeContext}
        targetToken={targetToken}
      />

      {children}
    </>
  )
}
