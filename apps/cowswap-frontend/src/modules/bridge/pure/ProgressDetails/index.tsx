import { Loader } from '@cowprotocol/ui'

import { DividerHorizontal } from '../../styles'
import { SwapAndBridgeStatus, SwapAndBridgeContext } from '../../types'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { CollapsibleBridgeRoute } from '../CollapsibleBridgeRoute'
import { BridgingProgressContent } from '../contents/BridgingProgressContent'
import { SwapResultContentContent } from '../contents/SwapResultContent'
import { ProtocolIcons } from '../ProtocolIcons'
import { BridgeStatusIcons, BridgeStatusTitlePrefixes, SwapStatusIcons, SwapStatusTitlePrefixes } from '../StopStatus'

interface QuoteDetailsProps {
  className?: string

  context: SwapAndBridgeContext
}

export function ProgressDetails({
  className,
  context: { bridgeProvider, overview, swapResultContext, quoteBridgeContext, bridgingProgressContext, bridgingStatus },
}: QuoteDetailsProps) {
  const { sourceAmounts, targetAmounts, sourceChainName, targetChainName } = overview
  const swapStatus = SwapAndBridgeStatus.DONE
  const isBridgingStarted = targetAmounts && bridgingProgressContext && quoteBridgeContext

  return (
    <CollapsibleBridgeRoute className={className} isCollapsible={false} isExpanded={true} providerInfo={bridgeProvider}>
      <BridgeDetailsContainer
        isCollapsible={true}
        defaultExpanded={!isBridgingStarted}
        status={swapStatus}
        stopNumber={1}
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

      {isBridgingStarted ? (
        <BridgeDetailsContainer
          isCollapsible={true}
          defaultExpanded={true}
          status={bridgingStatus}
          stopNumber={2}
          statusIcon={BridgeStatusIcons[bridgingStatus]}
          protocolIconShowOnly="second"
          titlePrefix={BridgeStatusTitlePrefixes[bridgingStatus]}
          protocolName={bridgeProvider.name}
          bridgeProvider={bridgeProvider}
          chainName={targetChainName}
          sellAmount={targetAmounts.sellAmount}
          buyAmount={targetAmounts.buyAmount}
        >
          <BridgingProgressContent progressContext={bridgingProgressContext} quoteContext={quoteBridgeContext} />
        </BridgeDetailsContainer>
      ) : (
        <div>
          {/*TODO: make it beautiful*/}
          Waiting for bridging details <Loader /> on{' '}
          <ProtocolIcons size={32} showOnlySecond secondProtocol={bridgeProvider} />
        </div>
      )}
    </CollapsibleBridgeRoute>
  )
}
