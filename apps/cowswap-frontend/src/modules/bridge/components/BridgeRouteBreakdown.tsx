import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import { getChainInfo, TokenWithLogo } from '@cowprotocol/common-const'
import { tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { InfoTooltip, UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import { useUsdAmount } from 'modules/usdAmount'

import { ProtocolIcons } from 'common/pure/ProtocolIcons'

import { BridgeStopDetails } from './BridgeStopDetails'
import {
  RouteHeader,
  RouteTitle,
  StopsInfo,
  Wrapper,
  ToggleArrow,
  CollapsibleStopsInfo,
  ClickableRouteHeader,
  DividerHorizontal,
} from './styled'
import { SwapStopDetails } from './SwapStopDetails'

import { BridgeFeeType, BridgeProtocolConfig } from '../types'

export function isFreeSwapFee(fee: string | BridgeFeeType): boolean {
  return fee === BridgeFeeType.FREE || fee === 'FREE' || fee === '0' || fee === '0.0'
}

export function getFeeTextColor(fee: string | BridgeFeeType): string | undefined {
  if (isFreeSwapFee(fee)) {
    return `var(${UI.COLOR_GREEN})`
  }
  return undefined
}

export interface BridgeRouteBreakdownProps {
  // Swap details
  sellAmount: string
  sellToken: string
  sellTokenAddress: string
  buyAmount: string
  buyToken: string
  buyTokenAddress: string
  networkCost: string
  swapMinReceive?: string
  swapExpectedToReceive?: string
  swapMaxSlippage?: string

  // Bridge details
  bridgeAmount: string
  bridgeToken: string
  bridgeTokenAddress: string
  bridgeReceiveAmount: string
  bridgeTokenReceiveAddress?: string
  bridgeFee: string | BridgeFeeType
  maxBridgeSlippage: string
  estimatedTime: number
  recipient: string
  bridgeProvider: BridgeProtocolConfig

  // Optional props with defaults
  recipientChainId?: SupportedChainId
  sourceChainId?: SupportedChainId
  tokenLogoSize?: number

  // Display options
  hideBridgeFlowFiatAmount?: boolean
  hideRouteHeader?: boolean

  // Overall Accordion functionality
  isCollapsible?: boolean
  isExpanded?: boolean
  onExpandToggle?: () => void

  // Section-level accordion functionality
  isSwapSectionCollapsible?: boolean
  isSwapSectionExpanded?: boolean
  onSwapSectionToggle?: () => void
  isBridgeSectionCollapsible?: boolean
  isBridgeSectionExpanded?: boolean
  onBridgeSectionToggle?: () => void
}

/**
 * BridgeRouteBreakdown component displays the details of a bridge transaction
 *
 * The component supports two display modes:
 * 1. Standard mode (default): Always shows the full breakdown
 * 2. Accordion mode: Can toggle between showing just the header (collapsed) or the full breakdown (expanded)
 *
 * Also supports independent collapsibility for the Swap and Bridge sections.
 */
export function BridgeRouteBreakdown({
  sellAmount,
  sellToken,
  sellTokenAddress,
  buyAmount,
  buyToken,
  buyTokenAddress,
  networkCost,
  swapMinReceive,
  swapExpectedToReceive,
  swapMaxSlippage,
  bridgeAmount,
  bridgeToken,
  bridgeTokenAddress,
  bridgeReceiveAmount,
  bridgeTokenReceiveAddress,
  bridgeFee,
  maxBridgeSlippage,
  estimatedTime,
  recipient,
  bridgeProvider,
  recipientChainId = SupportedChainId.MAINNET,
  sourceChainId = SupportedChainId.MAINNET,
  tokenLogoSize = 18,
  hideBridgeFlowFiatAmount = false,
  hideRouteHeader = false,
  isCollapsible = false,
  isExpanded = true,
  onExpandToggle = () => {},
  isSwapSectionCollapsible = false,
  isSwapSectionExpanded = true,
  onSwapSectionToggle = () => {},
  isBridgeSectionCollapsible = false,
  isBridgeSectionExpanded = true,
  onBridgeSectionToggle = () => {},
}: BridgeRouteBreakdownProps) {
  // Create token objects
  const sellTokenObj = new TokenWithLogo(
    undefined,
    sourceChainId,
    sellTokenAddress,
    18, // Default decimals
    sellToken,
    sellToken,
  )

  const buyTokenObj = new TokenWithLogo(
    undefined,
    sourceChainId,
    buyTokenAddress,
    18, // Default decimals
    buyToken,
    buyToken,
  )

  const sourceTokenObj = new TokenWithLogo(
    undefined,
    sourceChainId,
    bridgeTokenAddress,
    18, // Default decimals
    bridgeToken,
    bridgeToken,
  )

  const destTokenAddress = bridgeTokenReceiveAddress || bridgeTokenAddress

  const destTokenObj = new TokenWithLogo(
    undefined,
    recipientChainId,
    destTokenAddress,
    18, // Default decimals
    bridgeToken,
    bridgeToken,
  )

  const recipientChainInfo = getChainInfo(recipientChainId)
  const recipientChainName = recipientChainInfo.label

  const sourceChainInfo = getChainInfo(sourceChainId)
  const sourceChainName = sourceChainInfo.label

  // Derive CurrencyAmount and USD results using hooks
  const networkCostCurrency = networkCost ? tryParseCurrencyAmount(networkCost, sellTokenObj) : undefined
  const networkCostUsdResult = useUsdAmount(networkCostCurrency)

  const swapMinReceiveCurrency = swapMinReceive ? tryParseCurrencyAmount(swapMinReceive, buyTokenObj) : undefined
  const swapMinReceiveUsdResult = useUsdAmount(swapMinReceiveCurrency)

  const swapExpectedReceiveCurrency = swapExpectedToReceive
    ? tryParseCurrencyAmount(swapExpectedToReceive, buyTokenObj)
    : undefined
  const swapExpectedReceiveUsdResult = useUsdAmount(swapExpectedReceiveCurrency)

  const bridgeReceiveAmountCurrency = bridgeReceiveAmount
    ? tryParseCurrencyAmount(bridgeReceiveAmount, destTokenObj)
    : undefined
  const bridgeReceiveAmountUsdResult = useUsdAmount(bridgeReceiveAmountCurrency)

  // Handle overall header click for accordion functionality
  const handleHeaderClick = () => {
    if (isCollapsible) {
      onExpandToggle()
    }
  }

  // Determine header component based on overall collapsibility
  const HeaderComponent = isCollapsible ? ClickableRouteHeader : RouteHeader

  // Render the main header
  const renderHeader = () => (
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
          <ToggleArrow isOpen={isExpanded}>
            <SVG src={CarretIcon} title={isExpanded ? 'Close' : 'Open'} />
          </ToggleArrow>
        </CollapsibleStopsInfo>
      ) : (
        <StopsInfo>
          2 stops
          <ProtocolIcons secondProtocol={bridgeProvider} />
        </StopsInfo>
      )}
    </HeaderComponent>
  )

  // If overall component is collapsible and currently collapsed, render only the header
  if (isCollapsible && !isExpanded) {
    return <Wrapper>{!hideRouteHeader && renderHeader()}</Wrapper>
  }

  // Render the full breakdown (overall component is expanded or not collapsible)
  return (
    <Wrapper>
      {!hideRouteHeader && renderHeader()}

      {/* --- Swap Section --- */}
      <SwapStopDetails
        isCollapsible={isSwapSectionCollapsible}
        isExpanded={isSwapSectionExpanded}
        onToggle={onSwapSectionToggle}
        sellAmount={sellAmount}
        sellToken={sellToken}
        sellTokenObj={sellTokenObj}
        buyAmount={buyAmount}
        buyToken={buyToken}
        buyTokenObj={buyTokenObj}
        sourceChainName={sourceChainName}
        networkCost={networkCost}
        networkCostUsdResult={networkCostUsdResult}
        swapExpectedToReceive={swapExpectedToReceive}
        swapExpectedReceiveUsdResult={swapExpectedReceiveUsdResult}
        swapMaxSlippage={swapMaxSlippage}
        swapMinReceive={swapMinReceive}
        swapMinReceiveUsdResult={swapMinReceiveUsdResult}
        tokenLogoSize={tokenLogoSize}
        bridgeProvider={bridgeProvider}
      />

      <DividerHorizontal margin="8px 0 4px" />

      {/* --- Bridge Section --- */}
      <BridgeStopDetails
        isCollapsible={isBridgeSectionCollapsible}
        isExpanded={isBridgeSectionExpanded}
        onToggle={onBridgeSectionToggle}
        bridgeProvider={bridgeProvider}
        sourceTokenObj={sourceTokenObj}
        destTokenObj={destTokenObj}
        bridgeAmount={bridgeAmount}
        bridgeToken={bridgeToken}
        bridgeReceiveAmount={bridgeReceiveAmount}
        recipientChainName={recipientChainName}
        hideBridgeFlowFiatAmount={hideBridgeFlowFiatAmount}
        bridgeReceiveAmountUsdResult={bridgeReceiveAmountUsdResult}
        bridgeFee={bridgeFee}
        maxBridgeSlippage={maxBridgeSlippage}
        estimatedTime={estimatedTime}
        recipient={recipient}
        recipientChainId={recipientChainId}
        tokenLogoSize={tokenLogoSize}
      />
    </Wrapper>
  )
}
