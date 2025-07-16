import { ReactNode } from 'react'

import { COW_PROTOCOL_NAME } from '../../constants'
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

interface SwapStepProps {
  context: SwapAndBridgeContext
}

interface BridgeStepProps {
  context: SwapAndBridgeContext
  bridgeStatus: SwapAndBridgeStatus
}

function SwapStep({ context }: SwapStepProps): ReactNode {
  const { bridgeProvider, overview, swapResultContext } = context
  const { sourceAmounts, sourceChainName } = overview
  const swapStatus = SwapAndBridgeStatus.DONE

  return (
    <BridgeDetailsContainer
      isCollapsible
      defaultExpanded
      status={swapStatus}
      statusIcon={SwapStatusIcons[swapStatus]}
      protocolIconShowOnly="first"
      protocolIconSize={21}
      titlePrefix={SwapStatusTitlePrefixes[swapStatus]}
      protocolName={COW_PROTOCOL_NAME}
      bridgeProvider={bridgeProvider}
      chainName={sourceChainName}
      sellAmount={sourceAmounts.sellAmount}
      buyAmount={sourceAmounts.buyAmount}
    >
      <SwapResultContent context={swapResultContext} sellAmount={sourceAmounts.sellAmount} />
    </BridgeDetailsContainer>
  )
}

function BridgeStep({ context, bridgeStatus }: BridgeStepProps): ReactNode {
  const { bridgeProvider, overview, quoteBridgeContext, bridgingProgressContext, statusResult, explorerUrl } = context
  const { targetAmounts, targetChainName } = overview

  return (
    <BridgeDetailsContainer
      isCollapsible
      defaultExpanded
      status={bridgeStatus}
      statusIcon={BridgeStatusIcons[bridgeStatus]}
      protocolIconShowOnly="second"
      titlePrefix={BridgeStatusTitlePrefixes[bridgeStatus]}
      protocolName={bridgeProvider.name}
      bridgeProvider={bridgeProvider}
      chainName={targetChainName}
      sellAmount={targetAmounts?.sellAmount}
      buyAmount={targetAmounts?.buyAmount}
      explorerUrl={explorerUrl}
    >
      {bridgingProgressContext && quoteBridgeContext ? (
        <BridgingProgressContent
          statusResult={statusResult}
          progressContext={bridgingProgressContext}
          quoteContext={quoteBridgeContext}
          explorerUrl={explorerUrl}
        />
      ) : (
        <PreparingBridgingContent overview={overview} />
      )}
    </BridgeDetailsContainer>
  )
}

export function ProgressDetails({ className, context }: QuoteDetailsProps): ReactNode {
  const { bridgeProvider, bridgingStatus } = context
  const bridgeStatus = bridgingStatus === SwapAndBridgeStatus.DEFAULT ? SwapAndBridgeStatus.PENDING : bridgingStatus

  return (
    <CollapsibleBridgeRoute className={className} isCollapsible={false} isExpanded providerInfo={bridgeProvider}>
      <SwapStep context={context} />
      <DividerHorizontal margin="8px 0 4px" />
      <BridgeStep context={context} bridgeStatus={bridgeStatus} />
    </CollapsibleBridgeRoute>
  )
}
