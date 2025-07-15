import { ReactNode } from 'react'

import { BridgeSummaryRow, StepContent } from './styled'

import { SwapAndBridgeContext, SwapAndBridgeStatus } from '../../types'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { BridgingProgressContent } from '../contents/BridgingProgressContent'
import { PreparingBridgingContent } from '../contents/BridgingProgressContent/PreparingBridgingContent'
import { BridgeStatusIcons, BridgeStatusTitlePrefixes } from '../StopStatus'

interface BridgeStepRowProps {
  context: SwapAndBridgeContext
}

export function BridgeStepRow({ context }: BridgeStepRowProps): ReactNode {
  const {
    bridgingStatus,
    bridgeProvider,
    overview: { targetChainName, targetAmounts },
    bridgingProgressContext,
    quoteBridgeContext,
    statusResult,
  } = context

  const bridgeStatus = bridgingStatus === SwapAndBridgeStatus.DEFAULT ? SwapAndBridgeStatus.PENDING : bridgingStatus

  return (
    <BridgeSummaryRow>
      <b>Bridge</b>
      <StepContent>
        <BridgeDetailsContainer
          isCollapsible
          defaultExpanded={false}
          status={bridgeStatus}
          statusIcon={BridgeStatusIcons[bridgeStatus]}
          protocolIconShowOnly="second"
          protocolIconSize={21}
          circleSize={21}
          titlePrefix=""
          protocolName={`${BridgeStatusTitlePrefixes[bridgeStatus]} ${bridgeProvider.name}`}
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
            <PreparingBridgingContent overview={context.overview} />
          )}
        </BridgeDetailsContainer>
      </StepContent>
    </BridgeSummaryRow>
  )
}
