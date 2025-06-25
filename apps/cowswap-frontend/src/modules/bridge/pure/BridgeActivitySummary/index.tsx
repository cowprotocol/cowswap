import { ReactNode, memo } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount, FiatAmount } from '@cowprotocol/ui'
import type { Currency } from '@uniswap/sdk-core'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { OrderHooksDetails } from 'common/containers/OrderHooksDetails'

import { ShimmerWrapper, StepContent, SwapSummaryRow, BridgeSummaryRow, SummaryRow, FiatWrapper } from './styled'

import { SwapAndBridgeContext, SwapAndBridgeStatus } from '../../types'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { BridgingProgressContent } from '../contents/BridgingProgressContent'
import { PreparingBridgingContent } from '../contents/BridgingProgressContent/PreparingBridgingContent'
import { SwapResultContent } from '../contents/SwapResultContent'
import { RecipientDisplay } from '../RecipientDisplay'
import { BridgeStatusIcons, SwapStatusIcons } from '../StopStatus'

interface BridgeActivitySummaryProps {
  context: SwapAndBridgeContext | null
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
  order,
}: {
  surplusAmount: SwapAndBridgeContext['swapResultContext']['surplusAmount']
  surplusAmountUsd: SwapAndBridgeContext['swapResultContext']['surplusAmountUsd']
  sourceToken: Currency
  fulfillmentTime?: string
  order: Order
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

const BridgeSummaryHeader = memo(function BridgeSummaryHeader({
  sourceToken,
  targetToken,
  sourceAmounts,
  targetAmounts,
  sourceChainName,
  targetChainName,
}: {
  sourceToken: Currency
  targetToken: Currency
  sourceAmounts: SwapAndBridgeContext['overview']['sourceAmounts']
  targetAmounts: SwapAndBridgeContext['overview']['targetAmounts']
  sourceChainName: string
  targetChainName: string
}): ReactNode {
  return (
    <>
      {/* From Section */}
      <SummaryRow>
        <b>From</b>
        <i>
          <TokenLogo token={sourceToken} size={20} />
          <TokenAmount amount={sourceAmounts.sellAmount} tokenSymbol={sourceToken} />
          {` on ${sourceChainName}`}
        </i>
      </SummaryRow>

      {/* To Section */}
      <SummaryRow>
        <b>To at least</b>
        <i>
          <TokenLogo token={targetToken} size={20} />
          {targetAmounts ? (
            <TokenAmount amount={targetAmounts.buyAmount} tokenSymbol={targetToken} />
          ) : (
            <ShimmerWrapper />
          )}
          {` on ${targetChainName}`}
        </i>
      </SummaryRow>
    </>
  )
})

const BridgeLoadingState = memo(function BridgeLoadingState({
  order,
  fulfillmentTime,
  isCustomRecipient,
}: {
  order: Order
  fulfillmentTime?: string
  isCustomRecipient?: boolean
}): ReactNode {
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()
  const inputAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount)
  const feeAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.feeAmount)
  const sourceChainData = getChainInfo(order.inputToken.chainId)
  const targetChainData = bridgeSupportedNetworks?.find((chain) => chain.id === order.outputToken.chainId)

  return (
    <>
      <SummaryRow>
        <b>From</b>
        <i>
          <TokenLogo token={order.inputToken} size={20} />
          <TokenAmount amount={inputAmount.add(feeAmount)} tokenSymbol={order.inputToken} />
          {sourceChainData && ` on ${sourceChainData.name}`}
        </i>
      </SummaryRow>
      <SummaryRow>
        <b>To at least</b>
        <i>
          <TokenLogo token={order.outputToken} size={20} />
          <ShimmerWrapper />
          {targetChainData && ` on ${targetChainData.label}`}
        </i>
      </SummaryRow>
      <SummaryRow>
        <b>Swap</b>
        <i>
          <ShimmerWrapper />
        </i>
      </SummaryRow>
      <SummaryRow>
        <b>Bridge</b>
        <i>
          <ShimmerWrapper />
        </i>
      </SummaryRow>
      {fulfillmentTime && (
        <SummaryRow>
          <b>Filled on</b>
          <i>{fulfillmentTime}</i>
        </SummaryRow>
      )}
      {isCustomRecipient && (
        <SummaryRow>
          <b>Recipient</b>
          <i>
            <ShimmerWrapper />
          </i>
        </SummaryRow>
      )}
      {order.apiAdditionalInfo?.fullAppData && (
        <OrderHooksDetails appData={order.apiAdditionalInfo?.fullAppData} margin="10px 0 0">
          {(children) => (
            <SummaryRow>
              <b>Hooks</b>
              <i>{children}</i>
            </SummaryRow>
          )}
        </OrderHooksDetails>
      )}
    </>
  )
})

export function BridgeActivitySummary(props: BridgeActivitySummaryProps): ReactNode {
  const { context, order, fulfillmentTime, isCustomRecipient, receiverEnsName, children } = props

  // Show loading state if we don't have complete bridge data yet
  if (!context || !order || !context?.overview || !context?.swapResultContext) {
    // Can't show bridge activity without order data
    if (!order) {
      return null
    }

    return <BridgeLoadingState order={order} fulfillmentTime={fulfillmentTime} isCustomRecipient={isCustomRecipient} />
  }

  // Additional validation for required data
  const { overview, swapResultContext } = context
  const { sourceAmounts, targetCurrency } = overview

  if (!sourceAmounts || !targetCurrency) {
    return <BridgeLoadingState order={order} fulfillmentTime={fulfillmentTime} isCustomRecipient={isCustomRecipient} />
  }

  const { bridgeProvider, bridgingProgressContext, quoteBridgeContext, statusResult, bridgingStatus } = context

  const { targetAmounts, sourceChainName, targetChainName } = overview
  const { surplusAmount, surplusAmountUsd } = swapResultContext

  // Get tokens for display
  const sourceToken = sourceAmounts.buyAmount.currency // intermediate token after swap
  const targetToken = targetCurrency

  return (
    <>
      <BridgeSummaryHeader
        sourceToken={sourceToken}
        targetToken={targetToken}
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
        order={order}
        isCustomRecipient={isCustomRecipient}
        receiverEnsName={receiverEnsName}
        quoteBridgeContext={quoteBridgeContext}
        targetToken={targetToken}
      />

      {children}
    </>
  )
}
