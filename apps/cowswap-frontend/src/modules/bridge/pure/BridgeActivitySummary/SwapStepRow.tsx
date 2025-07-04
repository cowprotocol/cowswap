import { ReactNode } from 'react'

import { StepContent, SwapSummaryRow } from './styled'

import { SwapAndBridgeContext, SwapAndBridgeStatus } from '../../types'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { SwapResultContent } from '../contents/SwapResultContent'
import { SwapStatusIcons } from '../StopStatus'

interface SwapStepRowProps {
  context: SwapAndBridgeContext
}

// In that case swap is always already happened
const swapStatus = SwapAndBridgeStatus.DONE

export function SwapStepRow({ context }: SwapStepRowProps): ReactNode {
  const {
    bridgeProvider,
    overview: { sourceAmounts, sourceChainName },
    swapResultContext,
  } = context

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
          <SwapResultContent context={swapResultContext} sellAmount={sourceAmounts.sellAmount} />
        </BridgeDetailsContainer>
      </StepContent>
    </SwapSummaryRow>
  )
}
