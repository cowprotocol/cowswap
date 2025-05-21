import { useCallback, ReactNode } from 'react'

import { getChainInfo, TokenWithLogo } from '@cowprotocol/common-const'
import { BridgeQuoteResults, SupportedChainId } from '@cowprotocol/cow-sdk'
import { InfoTooltip, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { DividerHorizontal } from 'modules/bridge/styles'
import { ReceiveAmountInfo, useDerivedTradeState } from 'modules/trade'
import { useTradeSlippage } from 'modules/tradeSlippage'
import { useUsdAmount } from 'modules/usdAmount'

import { ProtocolIcons } from 'common/pure/ProtocolIcons'
import { ToggleArrow } from 'common/pure/ToggleArrow'

import { Wrapper, RouteHeader, RouteTitle, StopsInfo, CollapsibleStopsInfo, ClickableRouteHeader } from './styled'

import { useBridgeQuoteAmounts } from '../../hooks/useBridgeQuoteAmounts'
import { useBridgeSupportedNetworks } from '../../hooks/useBridgeSupportedNetworks'
import { useBridgeWinningSolverInfo } from '../../hooks/useBridgeWinningSolverInfo'
import { BridgeStopDetails } from '../../pure/BridgeStopDetails'
import { SwapStopDetails } from '../../pure/SwapStopDetails'
import { BridgeProtocolConfig } from '../../types'
import { StopStatusEnum } from '../../utils'

interface BridgeRouteUiParams {
  tokenLogoSize: number
  hasBackground: boolean

  // Display options
  hideBridgeFlowFiatAmount: boolean
  hideRouteHeader: boolean

  // Overall Accordion functionality
  isCollapsible: boolean
  isExpanded: boolean
  onExpandToggle: () => void
}

export interface BridgeRouteBreakdownProps {
  receiveAmountInfo: ReceiveAmountInfo
  bridgeQuote: BridgeQuoteResults
  bridgeProvider: BridgeProtocolConfig

  uiParams?: Partial<BridgeRouteUiParams>

  swapStatus?: StopStatusEnum
  bridgeStatus?: StopStatusEnum

  winningSolverId?: string | null
  receivedAmount?: CurrencyAmount<TokenWithLogo> | null
  surplusAmount?: CurrencyAmount<TokenWithLogo> | null
  swapExplorerUrl?: string
  bridgeExplorerUrl?: string
  collapsedDefault?: ReactNode
}

const defaultBridgeRouteUiParams: BridgeRouteUiParams = {
  tokenLogoSize: 18,
  hasBackground: false,
  hideBridgeFlowFiatAmount: false,
  hideRouteHeader: false,
  isCollapsible: false,
  isExpanded: true,
  onExpandToggle: () => {},
}

export function BridgeRouteBreakdown({
  receiveAmountInfo,
  bridgeQuote,
  bridgeProvider,
  swapStatus,
  bridgeStatus,
  uiParams = defaultBridgeRouteUiParams,
  winningSolverId,
  receivedAmount = null,
  surplusAmount = null,
  swapExplorerUrl,
  bridgeExplorerUrl,
  collapsedDefault,
}: BridgeRouteBreakdownProps) {
  const { account } = useWalletInfo()
  const { recipient } = useDerivedTradeState() || {}
  const swapSlippage = useTradeSlippage()
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()

  const amounts = useBridgeQuoteAmounts(receiveAmountInfo, bridgeQuote)

  const { sellAmount } = receiveAmountInfo.afterSlippage
  const sellToken = sellAmount.currency

  const sourceChainId = sellToken.chainId as SupportedChainId
  const targetChainId = amounts.swapMinReceiveAmount.currency.chainId

  const sourceChainData = getChainInfo(sourceChainId)
  const destChainData = bridgeSupportedNetworks?.find((chain) => chain.id === targetChainId)

  // Determine if we are in a mode where statuses are actively displayed (like the BridgeStatus fixture)
  // This is true if swapStatus is provided, indicating a status-aware context.
  const isInStatusDisplayMode = typeof swapStatus !== 'undefined'

  const winningSolverForSwapDetails = useBridgeWinningSolverInfo(sourceChainId, winningSolverId)

  const swapMinReceiveUsdInfo = useUsdAmount(receiveAmountInfo.afterSlippage.buyAmount)
  const swapExpectedReceiveUsdInfo = useUsdAmount(amounts.swapBuyAmount)

  const { value: bridgeReceiveAmountUsd } = useUsdAmount(amounts.bridgeMinReceiveAmount)
  const rawReceivedAmountUsdInfo = useUsdAmount(receivedAmount)
  const receivedAmountUsdInfo = receivedAmount ? rawReceivedAmountUsdInfo : null
  const rawSurplusAmountUsdInfo = useUsdAmount(surplusAmount)
  const surplusAmountUsdInfo = surplusAmount ? rawSurplusAmountUsdInfo : null

  const handleHeaderClick = useCallback(() => {
    if (uiParams.isCollapsible) {
      uiParams.onExpandToggle?.()
    }
  }, [uiParams])

  const {
    isCollapsible,
    isExpanded = defaultBridgeRouteUiParams.isExpanded,
    hasBackground = defaultBridgeRouteUiParams.hasBackground,
    tokenLogoSize = defaultBridgeRouteUiParams.tokenLogoSize,
    hideBridgeFlowFiatAmount = defaultBridgeRouteUiParams.hideBridgeFlowFiatAmount,
    hideRouteHeader = defaultBridgeRouteUiParams.hideRouteHeader,
  } = uiParams

  const HeaderComponent = isCollapsible ? ClickableRouteHeader : RouteHeader

  const headerContent = (
    <HeaderComponent onClick={isCollapsible ? handleHeaderClick : undefined}>
      <RouteTitle>
        Route{' '}
        <InfoTooltip
          content={
            <>
              Your trade will be executed in 2 stops. First, you swap on <b>CoW Protocol (Stop 1)</b>, then you bridge
              via <b>{bridgeProvider.title} (Stop 2)</b>.
            </>
          }
          size={14}
        />
      </RouteTitle>
      {isCollapsible ? (
        <CollapsibleStopsInfo>
          2 stops
          <ProtocolIcons secondProtocol={bridgeProvider} />
          <ToggleArrow isOpen={isExpanded} />
        </CollapsibleStopsInfo>
      ) : (
        <StopsInfo>
          2 stops
          <ProtocolIcons secondProtocol={bridgeProvider} />
        </StopsInfo>
      )}
    </HeaderComponent>
  )

  if (isCollapsible && !isExpanded) {
    return (
      <Wrapper hasBackground={hasBackground}>
        {!hideRouteHeader && headerContent}
        {collapsedDefault}
      </Wrapper>
    )
  }

  return (
    <Wrapper hasBackground={hasBackground}>
      {!hideRouteHeader && headerContent}

      <SwapStopDetails
        isCollapsible={isCollapsible}
        defaultExpanded={!isInStatusDisplayMode}
        status={swapStatus}
        receiveAmountInfo={receiveAmountInfo}
        sellCurrencyAmount={amounts.swapSellAmount}
        buyCurrencyAmount={amounts.swapBuyAmount}
        sourceChainName={sourceChainData.name}
        swapExpectedReceiveUsdInfo={swapExpectedReceiveUsdInfo}
        swapSlippage={swapSlippage}
        swapMinReceiveAmount={amounts.swapMinReceiveAmount}
        swapMinReceiveUsdInfo={swapMinReceiveUsdInfo}
        tokenLogoSize={tokenLogoSize}
        bridgeProvider={bridgeProvider}
        recipient={bridgeQuote.bridgeCallDetails.preAuthorizedBridgingHook.recipient}
        sourceChainId={sourceChainId}
        winningSolver={winningSolverForSwapDetails}
        receivedAmount={receivedAmount}
        receivedAmountUsdInfo={receivedAmountUsdInfo}
        surplusAmount={surplusAmount}
        surplusAmountUsdInfo={surplusAmountUsdInfo}
        swapExplorerUrl={swapExplorerUrl}
      />

      <DividerHorizontal
        margin="8px 0 4px"
        overrideColor={hasBackground ? `var(${UI.COLOR_PAPER_DARKEST})` : undefined}
      />

      <BridgeStopDetails
        isCollapsible={isCollapsible}
        defaultExpanded={true}
        status={bridgeStatus}
        bridgeProvider={bridgeProvider}
        bridgeSendCurrencyAmount={amounts.swapMinReceiveAmount}
        bridgeReceiveCurrencyAmount={amounts.bridgeMinReceiveAmount}
        recipientChainName={destChainData?.label || 'Unknow network'}
        hideBridgeFlowFiatAmount={hideBridgeFlowFiatAmount}
        receiveAmountUsd={bridgeReceiveAmountUsd}
        bridgeFee={amounts.bridgeFee}
        estimatedTime={bridgeQuote.expectedFillTimeSeconds}
        recipient={recipient || account}
        recipientChainId={targetChainId}
        tokenLogoSize={tokenLogoSize}
        bridgeExplorerUrl={bridgeExplorerUrl}
      />
    </Wrapper>
  )
}
