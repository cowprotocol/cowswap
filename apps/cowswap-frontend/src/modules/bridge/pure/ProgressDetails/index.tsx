import { DividerHorizontal } from '../../styles'
import { SwapAndBridgeContext } from '../../types'
import { StopStatusEnum } from '../../utils'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { CollapsibleBridgeRoute } from '../CollapsibleBridgeRoute'
import { BridgingProgressContent } from '../contents/BridgingProgressContent'
import { SwapResultContentContent } from '../contents/SwapResultContent'
import { BridgeStatusIcons, BridgeStatusTitlePrefixes, SwapStatusIcons, SwapStatusTitlePrefixes } from '../StopStatus'

interface QuoteDetailsProps {
  isCollapsible?: boolean
  className?: string

  context: SwapAndBridgeContext
}

export function ProgressDetails({
  isCollapsible,
  className,
  context: {
    bridgeProvider,
    quoteSwapContext,
    swapResultContext,
    quoteBridgeContext,
    bridgingProgressContext,
    bridgingStatus,
  },
}: QuoteDetailsProps) {
  const swapStatus = StopStatusEnum.DONE

  return (
    <CollapsibleBridgeRoute
      className={className}
      isCollapsible={isCollapsible}
      isExpanded={true}
      providerInfo={bridgeProvider}
    >
      <BridgeDetailsContainer
        isCollapsible={isCollapsible}
        defaultExpanded={true}
        status={swapStatus}
        stopNumber={1}
        statusIcon={SwapStatusIcons[swapStatus]}
        protocolIconShowOnly="first"
        protocolIconSize={21}
        titlePrefix={SwapStatusTitlePrefixes[swapStatus]}
        protocolName="CoW Protocol"
        bridgeProvider={bridgeProvider}
        chainName={quoteSwapContext.chainName}
        sellAmount={quoteSwapContext.sellAmount}
        buyAmount={quoteSwapContext.buyAmount}
      >
        <SwapResultContentContent context={swapResultContext} />
      </BridgeDetailsContainer>

      <DividerHorizontal margin="8px 0 4px" />

      <BridgeDetailsContainer
        isCollapsible={isCollapsible}
        defaultExpanded={true}
        status={bridgingStatus}
        stopNumber={2}
        statusIcon={BridgeStatusIcons[bridgingStatus]}
        protocolIconShowOnly="second"
        titlePrefix={BridgeStatusTitlePrefixes[bridgingStatus]}
        protocolName={bridgeProvider.name}
        bridgeProvider={bridgeProvider}
        chainName={quoteBridgeContext.chainName}
        sellAmount={quoteBridgeContext.sellAmount}
        buyAmount={quoteBridgeContext.buyAmount}
        buyAmountUsd={quoteBridgeContext.buyAmountUsd}
      >
        <BridgingProgressContent progressContext={bridgingProgressContext} quoteContext={quoteBridgeContext} />
      </BridgeDetailsContainer>
    </CollapsibleBridgeRoute>
  )
}
