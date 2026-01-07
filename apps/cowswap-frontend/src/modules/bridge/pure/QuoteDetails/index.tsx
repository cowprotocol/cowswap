import { ReactNode } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/sdk-bridging'

import { useLingui } from '@lingui/react/macro'

import { COW_PROTOCOL_NAME } from '../../constants'
import { DividerHorizontal } from '../../styles'
import { QuoteBridgeContext, QuoteSwapContext, SwapAndBridgeStatus } from '../../types'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { CollapsibleBridgeRoute } from '../CollapsibleBridgeRoute'
import { QuoteBridgeContent } from '../contents/QuoteBridgeContent'
import { QuoteSwapContent } from '../contents/QuoteSwapContent'
import { bridgeStatusTitlePrefixes, swapStatusTitlePrefixes } from '../StopStatus'

interface QuoteDetailsProps {
  isCollapsible?: boolean
  stepsCollapsible?: boolean
  hideRecommendedSlippage?: boolean
  bridgeProvider: BridgeProviderInfo
  swapContext: QuoteSwapContext
  bridgeContext: QuoteBridgeContext
  collapsedDefault?: ReactNode
}

interface SwapStepProps {
  stepsCollapsible: boolean
  hideRecommendedSlippage?: boolean
  bridgeProvider: BridgeProviderInfo
  swapContext: QuoteSwapContext
}

interface BridgeStepProps {
  stepsCollapsible: boolean
  hideRecommendedSlippage?: boolean
  bridgeProvider: BridgeProviderInfo
  bridgeContext: QuoteBridgeContext
}

function SwapStep({
  stepsCollapsible,
  bridgeProvider,
  swapContext,
  hideRecommendedSlippage,
}: SwapStepProps): ReactNode {
  const { i18n } = useLingui()
  const status = SwapAndBridgeStatus.DEFAULT

  return (
    <BridgeDetailsContainer
      isCollapsible={stepsCollapsible}
      defaultExpanded
      status={status}
      stopNumber={1}
      statusIcon={null}
      protocolIconShowOnly="first"
      protocolIconSize={21}
      titlePrefix={i18n._(swapStatusTitlePrefixes[status])}
      protocolName={COW_PROTOCOL_NAME}
      bridgeProvider={bridgeProvider}
      chainName={swapContext.chainName}
      sellAmount={swapContext.sellAmount}
      buyAmount={swapContext.buyAmount}
    >
      <QuoteSwapContent context={swapContext} hideRecommendedSlippage={hideRecommendedSlippage} />
    </BridgeDetailsContainer>
  )
}

function BridgeStep({ stepsCollapsible, bridgeProvider, bridgeContext }: BridgeStepProps): ReactNode {
  const { i18n } = useLingui()
  const status = SwapAndBridgeStatus.DEFAULT

  return (
    <BridgeDetailsContainer
      isCollapsible={stepsCollapsible}
      defaultExpanded
      status={status}
      stopNumber={2}
      statusIcon={null}
      protocolIconShowOnly="second"
      titlePrefix={i18n._(bridgeStatusTitlePrefixes[status])}
      protocolName={bridgeProvider.name}
      bridgeProvider={bridgeProvider}
      chainName={bridgeContext.chainName}
      sellAmount={bridgeContext.sellAmount}
      buyAmount={bridgeContext.buyAmount}
      buyAmountUsd={bridgeContext.buyAmountUsd}
    >
      <QuoteBridgeContent isQuoteDisplay quoteContext={bridgeContext} />
    </BridgeDetailsContainer>
  )
}

export function QuoteDetails({
  isCollapsible,
  stepsCollapsible = false,
  bridgeProvider,
  swapContext,
  bridgeContext,
  collapsedDefault,
  hideRecommendedSlippage,
}: QuoteDetailsProps): ReactNode {
  return (
    <CollapsibleBridgeRoute
      isCollapsible={isCollapsible}
      isExpanded
      providerInfo={bridgeProvider}
      collapsedDefault={collapsedDefault}
    >
      <SwapStep
        hideRecommendedSlippage={hideRecommendedSlippage}
        stepsCollapsible={stepsCollapsible}
        bridgeProvider={bridgeProvider}
        swapContext={swapContext}
      />
      <DividerHorizontal margin="8px 0 4px" />
      <BridgeStep stepsCollapsible={stepsCollapsible} bridgeProvider={bridgeProvider} bridgeContext={bridgeContext} />
    </CollapsibleBridgeRoute>
  )
}
