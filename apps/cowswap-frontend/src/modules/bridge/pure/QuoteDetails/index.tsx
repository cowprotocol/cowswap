import { ReactNode } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'
import { BannerOrientation, CollapsibleInlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { AddressLink } from 'common/pure/AddressLink'

import { DividerHorizontal } from '../../styles'
import { QuoteBridgeContext, QuoteSwapContext, SwapAndBridgeStatus } from '../../types'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { CollapsibleBridgeRoute } from '../CollapsibleBridgeRoute'
import { QuoteBridgeContent } from '../contents/QuoteBridgeContent'
import { QuoteSwapContent } from '../contents/QuoteSwapContent'
import { BridgeStatusTitlePrefixes, SwapStatusTitlePrefixes } from '../StopStatus'

interface QuoteDetailsProps {
  isCollapsible?: boolean

  bridgeProvider: BridgeProviderInfo
  swapContext: QuoteSwapContext
  bridgeContext: QuoteBridgeContext

  collapsedDefault?: ReactNode
}

export function QuoteDetails({
  isCollapsible,
  bridgeProvider,
  swapContext,
  bridgeContext,
  collapsedDefault,
}: QuoteDetailsProps): ReactNode {
  const status = SwapAndBridgeStatus.DEFAULT

  return (
    <CollapsibleBridgeRoute
      isCollapsible={isCollapsible}
      isExpanded
      providerInfo={bridgeProvider}
      collapsedDefault={collapsedDefault}
    >
      <BridgeDetailsContainer
        isCollapsible={isCollapsible}
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

      <CollapsibleInlineBanner
        bannerType={StatusColorVariant.Info}
        orientation={BannerOrientation.Horizontal}
        fontSize={13}
        collapsedContent={
          <div>
            Swap bridged via your proxy account:{' '}
            <AddressLink address={swapContext.recipient} chainId={swapContext.sellAmount.currency.chainId} />
          </div>
        }
        expandedContent={
          <div>
            CoW Swap uses a dedicated proxy account, controlled only by you, to ensure smooooth bridging. Confirm the
            recipient address above is{' '}
            <b>
              <AddressLink address={swapContext.recipient} chainId={swapContext.sellAmount.currency.chainId} />
            </b>{' '}
            - that’s your personal, private proxy account!
          </div>
        }
      />

      <DividerHorizontal margin="8px 0 4px" />

      <BridgeDetailsContainer
        isCollapsible={isCollapsible}
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
