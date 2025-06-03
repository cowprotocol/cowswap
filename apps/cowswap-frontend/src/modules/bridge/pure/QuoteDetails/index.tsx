import { ReactNode } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'

import { DividerHorizontal } from '../../styles'
import { QuoteBridgeContext, QuoteSwapContext, SwapAndBridgeStatus } from '../../types'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { CollapsibleBridgeRoute } from '../CollapsibleBridgeRoute'
import { QuoteBridgeContent } from '../contents/QuoteBridgeContent'
import { QuoteSwapContent } from '../contents/QuoteSwapContent'
import { BridgeStatusTitlePrefixes, SwapStatusTitlePrefixes } from '../StopStatus'

interface QuoteDetailsProps {
  isCollapsible?: boolean
  stepsCollapsible?: boolean

  bridgeProvider: BridgeProviderInfo
  swapContext: QuoteSwapContext
  bridgeContext: QuoteBridgeContext

  collapsedDefault?: ReactNode
}

export function QuoteDetails({
  isCollapsible,
  stepsCollapsible = false,
  bridgeProvider,
  swapContext,
  bridgeContext,
  collapsedDefault,
}: QuoteDetailsProps) {
  const status = SwapAndBridgeStatus.DEFAULT

  return (
    <CollapsibleBridgeRoute
      isCollapsible={isCollapsible}
      isExpanded={true}
      providerInfo={bridgeProvider}
      collapsedDefault={collapsedDefault}
    >
      <BridgeDetailsContainer
        isCollapsible={stepsCollapsible}
        defaultExpanded={true}
        status={status}
        stopNumber={1}
        statusIcon={null}
        protocolIconShowOnly="first"
        protocolIconSize={21}
        titlePrefix={SwapStatusTitlePrefixes[status]}
        protocolName="CoW Protocol"
        bridgeProvider={bridgeProvider}
        chainName={swapContext.chainName}
        sellAmount={swapContext.sellAmount}
        buyAmount={swapContext.buyAmount}
      >
        <QuoteSwapContent context={swapContext} />
      </BridgeDetailsContainer>

      <DividerHorizontal margin="8px 0 4px" />

      <BridgeDetailsContainer
        isCollapsible={stepsCollapsible}
        defaultExpanded={true}
        status={status}
        stopNumber={2}
        statusIcon={null}
        protocolIconShowOnly="second"
        titlePrefix={BridgeStatusTitlePrefixes[status]}
        protocolName={bridgeProvider.name}
        bridgeProvider={bridgeProvider}
        chainName={bridgeContext.chainName}
        sellAmount={bridgeContext.sellAmount}
        buyAmount={bridgeContext.buyAmount}
        buyAmountUsd={bridgeContext.buyAmountUsd}
      >
        <QuoteBridgeContent quoteContext={bridgeContext} />
      </BridgeDetailsContainer>
    </CollapsibleBridgeRoute>
  )
}
