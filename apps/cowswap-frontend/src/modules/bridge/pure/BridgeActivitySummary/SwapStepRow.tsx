import { ReactNode } from 'react'

import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { StepContent, SwapSummaryRow } from './styled'

import { SwapAndBridgeStatus, SwapResultContext } from '../../types'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { SwapResultContent } from '../contents/SwapResultContent'
import { SwapStatusIcons } from '../StopStatus'

interface SwapStepRowProps {
  swapResultContext: SwapResultContext

  sourceChainName: string

  sourceAmounts: {
    sellAmount: CurrencyAmount<Currency>
    buyAmount: CurrencyAmount<Currency>
  }
}

// In that case swap is always already happened
const swapStatus = SwapAndBridgeStatus.DONE

export function SwapStepRow({ swapResultContext, sourceAmounts, sourceChainName }: SwapStepRowProps): ReactNode {
  return (
    <SwapSummaryRow>
      <b>Swap</b>
      <StepContent>
        <BridgeDetailsContainer
          isCollapsible
          defaultExpanded={false}
          status={swapStatus}
          statusIcon={SwapStatusIcons[swapStatus]}
          protocolIconShowOnly="first"
          protocolIconSize={21}
          circleSize={21}
          titlePrefix=""
          protocolName="Swapped on CoW Protocol"
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
