import { ReactNode } from 'react'

import { DividerHorizontal } from '../../styles'
import { SwapAndBridgeStatus, SwapAndBridgeContext } from '../../types'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { CollapsibleBridgeRoute } from '../CollapsibleBridgeRoute'
import { BridgingProgressContent } from '../contents/BridgingProgressContent'
import { PreparingBridgingContent } from '../contents/BridgingProgressContent/PreparingBridgingContent'
import { SwapResultContent } from '../contents/SwapResultContent'
import { BridgeStatusIcons, BridgeStatusTitlePrefixes, SwapStatusIcons, SwapStatusTitlePrefixes } from '../StopStatus'

interface QuoteDetailsProps {
  className?: string
  context: SwapAndBridgeContext
}

export function ProgressDetails({
  className,
  context: {
    overview,
    swapResultContext,
    bridgeProvider,
    bridgingProgressContext,
    quoteBridgeContext,
    bridgingStatus,
    statusResult,
  },
}: QuoteDetailsProps): ReactNode {
  const { sourceAmounts, targetAmounts, sourceChainName, targetChainName } = overview

  // Swap is complete by the time this context exists (context requires execution data)
  // If context exists, swap must be DONE - otherwise component wouldn't render
  const swapStatus = SwapAndBridgeStatus.DONE
  const bridgeStatus = bridgingStatus === SwapAndBridgeStatus.DEFAULT ? SwapAndBridgeStatus.PENDING : bridgingStatus

  return (
    <CollapsibleBridgeRoute className={className} isCollapsible={false} isExpanded={true} providerInfo={bridgeProvider}>
      <BridgeDetailsContainer
        isCollapsible={true}
        defaultExpanded={true}
        status={swapStatus}
        statusIcon={SwapStatusIcons[swapStatus]}
        protocolIconShowOnly="first"
        protocolIconSize={21}
        titlePrefix={SwapStatusTitlePrefixes[swapStatus]}
        protocolName="CoW Protocol"
        bridgeProvider={bridgeProvider}
        chainName={sourceChainName}
        sellAmount={sourceAmounts.sellAmount}
        buyAmount={sourceAmounts.buyAmount}
      >
        <SwapResultContent context={swapResultContext} sellAmount={sourceAmounts.sellAmount} />
      </BridgeDetailsContainer>
      <DividerHorizontal margin="8px 0 4px" />
      <BridgeDetailsContainer
        isCollapsible={true}
        defaultExpanded={true}
        status={bridgeStatus}
        statusIcon={BridgeStatusIcons[bridgeStatus]}
        protocolIconShowOnly="second"
        protocolIconSize={21}
        titlePrefix={BridgeStatusTitlePrefixes[bridgeStatus] || ''}
        protocolName={bridgeProvider.name}
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
    </CollapsibleBridgeRoute>
  )
}
