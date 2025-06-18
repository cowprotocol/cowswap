import { ReactNode, memo } from 'react'

import { ExplorerDataType, getExplorerLink, shortenAddress } from '@cowprotocol/common-utils'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenAmount, FiatAmount, ExternalLink } from '@cowprotocol/ui'
import type { Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { OrderHooksDetails } from 'common/containers/OrderHooksDetails'
import { SummaryRow } from 'common/pure/SummaryRow'

import { SwapAndBridgeContext, SwapAndBridgeStatus } from '../../types'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { BridgingProgressContent } from '../contents/BridgingProgressContent'
import { PreparingBridgingContent } from '../contents/BridgingProgressContent/PreparingBridgingContent'
import { SwapResultContent } from '../contents/SwapResultContent'
import { BridgeStatusIcons, SwapStatusIcons } from '../StopStatus'

const FiatWrapper = styled.span`
  margin-left: 5px;
  align-items: center;
  display: flex;
`

interface BridgeActivitySummaryProps {
  context: SwapAndBridgeContext
  order: Order
  fulfillmentTime?: string
  isCustomRecipient?: boolean
  receiverEnsName?: string | null
  appData?: string | false | null
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

const SwapStepRow = memo(function SwapStepRow({
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
    <SummaryRow>
      <b>Swap</b>
      <i>
        <BridgeDetailsContainer
          isCollapsible={true}
          defaultExpanded={false}
          status={swapStatus}
          statusIcon={SwapStatusIcons[swapStatus]}
          protocolIconShowOnly="first"
          protocolIconSize={21}
          titlePrefix=""
          protocolName="Swapped on CoW Protocol"
          bridgeProvider={bridgeProvider}
          chainName={sourceChainName}
          sellAmount={sourceAmounts.sellAmount}
          buyAmount={sourceAmounts.buyAmount}
        >
          <SwapResultContent context={swapResultContext} />
        </BridgeDetailsContainer>
      </i>
    </SummaryRow>
  )
})

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
    <SummaryRow>
      <b>Bridge</b>
      <i>
        <BridgeDetailsContainer
          isCollapsible={true}
          defaultExpanded={false}
          status={bridgeStatus}
          statusIcon={BridgeStatusIcons[bridgeStatus]}
          protocolIconShowOnly="second"
          protocolIconSize={21}
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
      </i>
    </SummaryRow>
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
  order,
  isCustomRecipient,
  receiverEnsName,
  appData,
}: {
  surplusAmount: SwapAndBridgeContext['swapResultContext']['surplusAmount']
  surplusAmountUsd: SwapAndBridgeContext['swapResultContext']['surplusAmountUsd']
  sourceToken: Currency
  fulfillmentTime?: string
  order: Order
  isCustomRecipient?: boolean
  receiverEnsName?: string | null
  appData?: string | false | null
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

      {/* Recipient Section */}
      {isCustomRecipient && (
        <SummaryRow>
          <b>Recipient:</b>
          <i>
            <ExternalLink
              href={getExplorerLink(order.inputToken.chainId, order.receiver || order.owner, ExplorerDataType.ADDRESS)}
            >
              {receiverEnsName || shortenAddress(order.receiver || order.owner)} ↗
            </ExternalLink>
          </i>
        </SummaryRow>
      )}

      {/* Hooks Section */}
      {appData && (
        <OrderHooksDetails appData={appData} margin="10px 0 0">
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
      {targetAmounts && (
        <SummaryRow>
          <b>To at least</b>
          <i>
            <TokenLogo token={targetToken} size={20} />
            <TokenAmount amount={targetAmounts.buyAmount} tokenSymbol={targetToken} />
            {` on ${targetChainName}`}
          </i>
        </SummaryRow>
      )}
    </>
  )
})

function validateBridgeData(context: SwapAndBridgeContext | null, order: Order | null): ReactNode | null {
  if (!context || !order) {
    return (
      <SummaryRow>
        <b>Loading...</b>
        <i>Bridge details unavailable</i>
      </SummaryRow>
    )
  }

  const { overview, swapResultContext } = context

  if (!overview || !swapResultContext) {
    return (
      <SummaryRow>
        <b>Error</b>
        <i>Bridge data incomplete</i>
      </SummaryRow>
    )
  }

  const { sourceAmounts, targetCurrency } = overview

  if (!sourceAmounts || !targetCurrency) {
    return (
      <SummaryRow>
        <b>Error</b>
        <i>Missing bridge token data</i>
      </SummaryRow>
    )
  }

  return null
}

export function BridgeActivitySummary(props: BridgeActivitySummaryProps): ReactNode {
  const { context, order, fulfillmentTime, isCustomRecipient, receiverEnsName, appData } = props

  // Validate data and return early if invalid
  const validationError = validateBridgeData(context, order)
  if (validationError) return validationError

  const {
    overview,
    swapResultContext,
    bridgeProvider,
    bridgingProgressContext,
    quoteBridgeContext,
    statusResult,
    bridgingStatus,
  } = context!

  const { sourceAmounts, targetAmounts, sourceChainName, targetChainName, targetCurrency } = overview!
  const { surplusAmount, surplusAmountUsd } = swapResultContext!

  // Get tokens for display
  const sourceToken = sourceAmounts!.buyAmount.currency // intermediate token after swap
  const targetToken = targetCurrency!

  return (
    <>
      <BridgeSummaryHeader
        sourceToken={sourceToken}
        targetToken={targetToken}
        sourceAmounts={sourceAmounts!}
        targetAmounts={targetAmounts}
        sourceChainName={sourceChainName!}
        targetChainName={targetChainName!}
      />

      <BridgeStepDetails
        swapResultContext={swapResultContext!}
        bridgeProvider={bridgeProvider}
        sourceAmounts={sourceAmounts!}
        targetAmounts={targetAmounts}
        sourceChainName={sourceChainName!}
        targetChainName={targetChainName!}
        bridgingProgressContext={bridgingProgressContext}
        quoteBridgeContext={quoteBridgeContext}
        statusResult={statusResult}
        bridgingStatus={bridgingStatus}
        order={order!}
      />

      <BridgeMetaDetails
        surplusAmount={surplusAmount}
        surplusAmountUsd={surplusAmountUsd}
        sourceToken={sourceToken}
        fulfillmentTime={fulfillmentTime}
        order={order!}
        isCustomRecipient={isCustomRecipient}
        receiverEnsName={receiverEnsName}
        appData={appData}
      />
    </>
  )
}
