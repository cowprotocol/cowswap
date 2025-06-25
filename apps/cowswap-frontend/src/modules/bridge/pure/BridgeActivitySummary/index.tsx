import { ReactNode, memo } from 'react'

import { TokenAmount, FiatAmount } from '@cowprotocol/ui'
import type { Currency } from '@uniswap/sdk-core'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { ShimmerWrapper, SummaryRow } from 'common/pure/OrderSummaryRow'

import { BridgeSummaryHeader } from './BridgeSummaryHeader'
import { StepContent, SwapSummaryRow, BridgeSummaryRow, FiatWrapper } from './styled'

import { SwapAndBridgeContext, SwapAndBridgeStatus } from '../../types'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { BridgingProgressContent } from '../contents/BridgingProgressContent'
import { PreparingBridgingContent } from '../contents/BridgingProgressContent/PreparingBridgingContent'
import { SwapResultContent } from '../contents/SwapResultContent'
import { RecipientDisplay } from '../RecipientDisplay'
import { BridgeStatusIcons, SwapStatusIcons } from '../StopStatus'

interface BridgeActivitySummaryProps {
  context: SwapAndBridgeContext
  order: Order
  children: ReactNode
  fulfillmentTime?: string
  isCustomRecipient?: boolean
  receiverEnsName?: string | null
}

interface StepDetailsProps {
  swapResultContext: SwapAndBridgeContext['swapResultContext']
  bridgeProvider: SwapAndBridgeContext['bridgeProvider']
  sourceAmounts: SwapAndBridgeContext['overview']['sourceAmounts']
  targetAmounts: SwapAndBridgeContext['overview']['targetAmounts']
  sourceChainName: string
  targetChainName: string
  bridgingProgressContext: SwapAndBridgeContext['bridgingProgressContext']
  quoteBridgeContext: SwapAndBridgeContext['quoteBridgeContext']
  statusResult: SwapAndBridgeContext['statusResult']
  bridgingStatus: SwapAndBridgeContext['bridgingStatus']
  order: Order
}

function SwapStepRow({
  swapResultContext,
  bridgeProvider,
  sourceAmounts,
  sourceChainName,
  swapStatus,
}: {
  swapResultContext: SwapAndBridgeContext['swapResultContext']
  bridgeProvider: SwapAndBridgeContext['bridgeProvider']
  sourceAmounts: SwapAndBridgeContext['overview']['sourceAmounts']
  sourceChainName: string
  swapStatus: SwapAndBridgeStatus
}): ReactNode {
  return (
    <SwapSummaryRow>
      <b>Swap</b>
      <StepContent>
        <BridgeDetailsContainer
          isCollapsible={true}
          defaultExpanded={false}
          status={swapStatus}
          statusIcon={SwapStatusIcons[swapStatus]}
          protocolIconShowOnly="first"
          protocolIconSize={21}
          circleSize={21}
          titlePrefix=""
          protocolName="Swapped on CoW Protocol"
          bridgeProvider={bridgeProvider}
          chainName={sourceChainName}
          sellAmount={sourceAmounts.sellAmount}
          buyAmount={sourceAmounts.buyAmount}
        >
          <SwapResultContent context={swapResultContext} />
        </BridgeDetailsContainer>
      </StepContent>
    </SwapSummaryRow>
  )
}

const BridgeStepRow = memo(function BridgeStepRow({
  bridgeProvider,
  targetAmounts,
  targetChainName,
  bridgeStatus,
  bridgingProgressContext,
  quoteBridgeContext,
  statusResult,
}: {
  bridgeProvider: SwapAndBridgeContext['bridgeProvider']
  targetAmounts: SwapAndBridgeContext['overview']['targetAmounts']
  targetChainName: string
  bridgeStatus: SwapAndBridgeStatus
  bridgingProgressContext: SwapAndBridgeContext['bridgingProgressContext']
  quoteBridgeContext: SwapAndBridgeContext['quoteBridgeContext']
  statusResult: SwapAndBridgeContext['statusResult']
}): ReactNode {
  return (
    <BridgeSummaryRow>
      <b>Bridge</b>
      <StepContent>
        <BridgeDetailsContainer
          isCollapsible={true}
          defaultExpanded={false}
          status={bridgeStatus}
          statusIcon={BridgeStatusIcons[bridgeStatus]}
          protocolIconShowOnly="second"
          protocolIconSize={21}
          circleSize={21}
          titlePrefix=""
          protocolName={`Bridged via ${bridgeProvider.name}`}
          bridgeProvider={bridgeProvider}
          chainName={targetChainName}
          sellAmount={targetAmounts?.sellAmount}
          buyAmount={targetAmounts?.buyAmount}
        >
          {bridgingProgressContext && quoteBridgeContext ? (
            <BridgingProgressContent
              statusResult={statusResult}
              progressContext={bridgingProgressContext}
              quoteContext={quoteBridgeContext}
            />
          ) : (
            <PreparingBridgingContent />
          )}
        </BridgeDetailsContainer>
      </StepContent>
    </BridgeSummaryRow>
  )
})

const BridgeStepDetails = memo(function BridgeStepDetails(props: StepDetailsProps): ReactNode {
  const {
    swapResultContext,
    bridgeProvider,
    sourceAmounts,
    targetAmounts,
    sourceChainName,
    targetChainName,
    bridgingProgressContext,
    quoteBridgeContext,
    statusResult,
    bridgingStatus,
    order,
  } = props

  // Derive swap status from order status - swap is done when order is fulfilled
  const swapStatus = order.status === OrderStatus.FULFILLED ? SwapAndBridgeStatus.DONE : SwapAndBridgeStatus.PENDING
  // Bridge status is derived from context, defaulting to PENDING if not set
  const bridgeStatus = bridgingStatus === SwapAndBridgeStatus.DEFAULT ? SwapAndBridgeStatus.PENDING : bridgingStatus

  return (
    <>
      <SwapStepRow
        swapResultContext={swapResultContext}
        bridgeProvider={bridgeProvider}
        sourceAmounts={sourceAmounts}
        sourceChainName={sourceChainName}
        swapStatus={swapStatus}
      />
      <BridgeStepRow
        bridgeProvider={bridgeProvider}
        targetAmounts={targetAmounts}
        targetChainName={targetChainName}
        bridgeStatus={bridgeStatus}
        bridgingProgressContext={bridgingProgressContext}
        quoteBridgeContext={quoteBridgeContext}
        statusResult={statusResult}
      />
    </>
  )
})

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
  const { context, order, fulfillmentTime, isCustomRecipient, receiverEnsName, children } = props

  // Additional validation for required data
  const { overview, swapResultContext } = context
  const { sourceAmounts, targetCurrency } = overview

  const { bridgeProvider, bridgingProgressContext, quoteBridgeContext, statusResult, bridgingStatus } = context

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

      <BridgeStepDetails
        swapResultContext={swapResultContext}
        bridgeProvider={bridgeProvider}
        sourceAmounts={sourceAmounts}
        targetAmounts={targetAmounts}
        sourceChainName={sourceChainName}
        targetChainName={targetChainName}
        bridgingProgressContext={bridgingProgressContext}
        quoteBridgeContext={quoteBridgeContext}
        statusResult={statusResult}
        bridgingStatus={bridgingStatus}
        order={order}
      />

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
