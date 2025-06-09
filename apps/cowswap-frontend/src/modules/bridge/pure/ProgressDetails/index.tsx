import { DividerHorizontal } from '../../styles'
import { SwapAndBridgeStatus, SwapAndBridgeContext } from '../../types'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { CollapsibleBridgeRoute } from '../CollapsibleBridgeRoute'
import { BridgingProgressContent } from '../contents/BridgingProgressContent'
import { PreparingBridgingContent } from '../contents/BridgingProgressContent/PreparingBridgingContent'
import { SwapResultContentContent } from '../contents/SwapResultContent'
import { BridgeStatusIcons, BridgeStatusTitlePrefixes, SwapStatusIcons, SwapStatusTitlePrefixes } from '../StopStatus'

interface QuoteDetailsProps {
  className?: string

  context: SwapAndBridgeContext
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function ProgressDetails({
  className,
  context: {
    bridgeProvider,
    overview,
    swapResultContext,
    quoteBridgeContext,
    bridgingProgressContext,
    bridgingStatus,
    statusResult,
  },
}: QuoteDetailsProps) {
  const { sourceAmounts, targetAmounts, sourceChainName, targetChainName } = overview
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
        <SwapResultContentContent context={swapResultContext} />
      </BridgeDetailsContainer>
      <DividerHorizontal margin="8px 0 4px" />
      <BridgeDetailsContainer
        isCollapsible={true}
        defaultExpanded={true}
        status={bridgeStatus}
        statusIcon={BridgeStatusIcons[bridgeStatus]}
        protocolIconShowOnly="second"
        titlePrefix={BridgeStatusTitlePrefixes[bridgeStatus]}
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
