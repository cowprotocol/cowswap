import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import { getChainInfo, TokenWithLogo } from '@cowprotocol/common-const'
import { useTheme } from '@cowprotocol/common-hooks'
import {
  displayTime,
  ExplorerDataType,
  getExplorerLink,
  isAddress,
  shortenAddress,
  tryParseCurrencyAmount,
} from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { FiatAmount, InfoTooltip, UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReceiveAmountTitle } from 'modules/trade/pure/ReceiveAmountTitle'
import { DividerHorizontal } from 'modules/trade/pure/Row/styled'
import { useUsdAmount } from 'modules/usdAmount'

import { ProtocolIcons } from 'common/pure/ProtocolIcons'

import {
  AmountWithTokenIcon,
  ArrowIcon,
  Link,
  NetworkLogoWrapper,
  RecipientWrapper,
  RouteHeader,
  RouteTitle,
  StopNumberCircle,
  StopTitle,
  StopsInfo,
  TokenFlowContainer,
  SectionContent,
  Wrapper,
} from './styled'

import { BridgeFeeType, BridgeProtocolConfig } from '../types'

/**
 * Check if a fee is free (zero)
 * @param fee The fee value or fee type
 * @returns True if the fee is free
 */
export function isFreeSwapFee(fee: string | BridgeFeeType): boolean {
  return fee === BridgeFeeType.FREE || fee === 'FREE' || fee === '0' || fee === '0.0'
}

/**
 * Get the CSS color variable for a fee based on its type
 * @param fee The fee value or fee type
 * @returns The CSS color variable or undefined if no special color applies
 */
export function getFeeTextColor(fee: string | BridgeFeeType): string | undefined {
  if (isFreeSwapFee(fee)) {
    return `var(${UI.COLOR_GREEN})`
  }

  return undefined
}

/**
 * NetworkLogo component displays a network logo
 */
function NetworkLogo({ chainId, size = 16 }: { chainId: SupportedChainId; size?: number }) {
  const theme = useTheme()
  const chainInfo = getChainInfo(chainId)
  const logoUrl = theme.darkMode ? chainInfo.logo.dark : chainInfo.logo.light

  return (
    <NetworkLogoWrapper size={size}>
      <img src={logoUrl} alt={`${chainInfo.label} network logo`} />
    </NetworkLogoWrapper>
  )
}

/**
 * Props for the BridgeRouteBreakdown component
 */
export interface BridgeRouteBreakdownProps {
  // Swap details
  sellAmount: string
  sellToken: string
  sellTokenAddress: string
  buyAmount: string
  buyToken: string
  buyTokenAddress: string
  networkCost: string
  networkCostUsd: string
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

  // Accordion functionality
  /**
   * Whether the component should be collapsible/expandable.
   * When true, clicking the header will toggle between collapsed (header only) and expanded (full breakdown) views.
   */
  isCollapsible?: boolean

  /**
   * Whether the component is currently expanded.
   * - When true: shows the full route breakdown
   * - When false and isCollapsible is true: shows only the header
   * Only relevant when isCollapsible is true.
   */
  isExpanded?: boolean

  /**
   * Callback function invoked when the header is clicked in collapsible mode.
   * The parent component should use this to toggle the isExpanded state.
   */
  onExpandToggle?: () => void

  // Section-level accordion functionality
  /** Swap section can be collapsed */
  isSwapSectionCollapsible?: boolean
  /** Current expanded state for swap section */
  isSwapSectionExpanded?: boolean
  /** Callback when swap section header is clicked */
  onSwapSectionToggle?: () => void

  /** Bridge section can be collapsed */
  isBridgeSectionCollapsible?: boolean
  /** Current expanded state for bridge section */
  isBridgeSectionExpanded?: boolean
  /** Callback when bridge section header is clicked */
  onBridgeSectionToggle?: () => void
}

// Toggle arrow component for the collapsible header
const ToggleArrow = styled.div<{ isOpen: boolean }>`
  --size: var(${UI.ICON_SIZE_SMALL});
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);

  > svg {
    --size: var(${UI.ICON_SIZE_TINY});
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    transition: fill var(${UI.ANIMATION_DURATION}) ease-in-out;

    path {
      fill: var(${UI.COLOR_TEXT_OPACITY_70});
    }
  }
`

// Modified StopsInfo to include toggle arrow when collapsible
const CollapsibleStopsInfo = styled(StopsInfo)`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    color: var(${UI.COLOR_TEXT});

    ${ToggleArrow} {
      > svg {
        path {
          fill: var(${UI.COLOR_TEXT});
        }
      }
    }
  }
`

// Add a styled version of RouteHeader with clickable behavior
const ClickableRouteHeader = styled(RouteHeader)`
  cursor: pointer;

  &:hover {
    ${RouteTitle} {
      color: var(${UI.COLOR_TEXT});
    }
  }
`

// Clickable version of StopTitle
const ClickableStopTitle = styled(StopTitle)<{ isCollapsible?: boolean }>`
  /* Preserve original StopTitle styling, just add clickable behavior */
  cursor: ${({ isCollapsible }) => (isCollapsible ? 'pointer' : 'default')};
  position: relative; /* For absolute positioning of the toggle icon */

  &:hover {
    opacity: ${({ isCollapsible }) => (isCollapsible ? 0.8 : 1)};
  }
`

// Absolutely positioned toggle icon container (to avoid affecting layout)
const ToggleIconContainer = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
`

/**
 * BridgeRouteBreakdown component displays the details of a bridge transaction
 *
 * The component supports two display modes:
 * 1. Standard mode (default): Always shows the full breakdown
 * 2. Accordion mode: Can toggle between showing just the header (collapsed) or the full breakdown (expanded)
 *
 * To use in accordion mode, set:
 * - isCollapsible={true} - Enables accordion functionality
 * - isExpanded={yourExpandedState} - Controls whether it's expanded or collapsed
 * - onExpandToggle={yourToggleFunction} - Handles the expand/collapse action
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
  recipientChainId = SupportedChainId.MAINNET, // Default to Ethereum mainnet
  sourceChainId = SupportedChainId.MAINNET, // Default to Ethereum mainnet
  tokenLogoSize = 18,
  hideBridgeFlowFiatAmount = false,
  hideRouteHeader = false,
  isCollapsible = false, // Default to non-collapsible mode
  isExpanded = true, // Default to expanded if collapsible
  onExpandToggle = () => {}, // Default no-op
  // Section-level defaults
  isSwapSectionCollapsible = false,
  isSwapSectionExpanded = true,
  onSwapSectionToggle = () => {},
  isBridgeSectionCollapsible = false,
  isBridgeSectionExpanded = true,
  onBridgeSectionToggle = () => {},
}: BridgeRouteBreakdownProps) {
  // Create token objects for the swap tokens
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

  // Create token objects for the bridge tokens (source and destination)
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

  // Derive CurrencyAmount and USD value for networkCost
  const networkCostCurrency = networkCost ? tryParseCurrencyAmount(networkCost, sellTokenObj) : undefined
  const { value: networkCostUsdValue } = useUsdAmount(networkCostCurrency)

  const swapMinReceiveCurrency = swapMinReceive ? tryParseCurrencyAmount(swapMinReceive, buyTokenObj) : undefined
  const { value: swapMinReceiveUsd } = useUsdAmount(swapMinReceiveCurrency)

  const swapExpectedReceiveCurrency = swapExpectedToReceive
    ? tryParseCurrencyAmount(swapExpectedToReceive, buyTokenObj)
    : undefined
  const { value: swapExpectedReceiveUsd } = useUsdAmount(swapExpectedReceiveCurrency)

  const bridgeReceiveAmountCurrency = bridgeReceiveAmount
    ? tryParseCurrencyAmount(bridgeReceiveAmount, destTokenObj)
    : undefined
  const { value: bridgeReceiveAmountUsd } = useUsdAmount(bridgeReceiveAmountCurrency)

  // Handle header click for accordion functionality - triggers the callback to toggle expanded state
  const handleHeaderClick = () => {
    if (isCollapsible) {
      onExpandToggle()
    }
  }

  // Renders the route header - shared between collapsed and expanded views to avoid code duplication
  const renderHeader = () => {
    // Use different header component based on whether it's collapsible
    const HeaderComponent = isCollapsible ? ClickableRouteHeader : RouteHeader

    return (
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
          // Enhanced version with toggle arrow for collapsible mode
          <CollapsibleStopsInfo>
            2 stops
            <ProtocolIcons secondProtocol={bridgeProvider} />
            <ToggleArrow isOpen={isExpanded}>
              <SVG src={CarretIcon} title={isExpanded ? 'Close' : 'Open'} />
            </ToggleArrow>
          </CollapsibleStopsInfo>
        ) : (
          // Standard version without toggle arrow for non-collapsible mode
          <StopsInfo>
            2 stops
            <ProtocolIcons secondProtocol={bridgeProvider} />
          </StopsInfo>
        )}
      </HeaderComponent>
    )
  }

  // When in collapsible mode and collapsed state, render only the header
  if (isCollapsible && !isExpanded) {
    return <Wrapper>{renderHeader()}</Wrapper>
  }

  // Standard rendering (either not collapsible or in expanded state) - shows full content
  return (
    <Wrapper>
      {!hideRouteHeader && renderHeader()}

      {/* Swap Section Header - Can be clicked if collapsible */}
      <ClickableStopTitle
        isCollapsible={isSwapSectionCollapsible}
        onClick={isSwapSectionCollapsible ? onSwapSectionToggle : undefined}
      >
        <StopNumberCircle>1</StopNumberCircle>
        <b>
          <span>Swap on </span>
          <ProtocolIcons showOnlyFirst size={21} secondProtocol={bridgeProvider} />
          <span> CoW Protocol</span>
        </b>
        {isSwapSectionCollapsible && (
          <ToggleIconContainer>
            <ToggleArrow isOpen={isSwapSectionExpanded}>
              <SVG src={CarretIcon} title={isSwapSectionExpanded ? 'Close' : 'Open'} />
            </ToggleArrow>
          </ToggleIconContainer>
        )}
      </ClickableStopTitle>

      {/* Swap Section Content - Can be collapsed */}
      <SectionContent isExpanded={isSwapSectionExpanded}>
        <ConfirmDetailsItem label="" withTimelineDot>
          <TokenFlowContainer>
            <AmountWithTokenIcon>
              <TokenLogo token={sellTokenObj} size={tokenLogoSize} />
              {sellAmount} {sellToken}
            </AmountWithTokenIcon>
            <ArrowIcon>→</ArrowIcon>
            <AmountWithTokenIcon>
              <TokenLogo token={buyTokenObj} size={tokenLogoSize} />
              {buyAmount} {buyToken} on {sourceChainName}
            </AmountWithTokenIcon>
          </TokenFlowContainer>
        </ConfirmDetailsItem>

        <ConfirmDetailsItem
          label={
            <>
              Swap fee <InfoTooltip content="No fee for order placement!" size={14} />
            </>
          }
          withTimelineDot
          contentTextColor={getFeeTextColor('FREE')}
        >
          FREE
        </ConfirmDetailsItem>

        <ConfirmDetailsItem
          label={
            <>
              Network cost (est.){' '}
              <InfoTooltip
                content="This is the cost of settling your order on-chain, including gas and any LP fees. CoW Swap will try to lower this cost where possible."
                size={14}
              />
            </>
          }
          withTimelineDot
        >
          {networkCost} {sellToken}&nbsp;
          {networkCostUsdValue && (
            <i>
              (<FiatAmount amount={networkCostUsdValue} />)
            </i>
          )}
        </ConfirmDetailsItem>

        {swapExpectedToReceive && (
          <ConfirmDetailsItem
            withTimelineDot
            label={
              <>
                Expected to receive{' '}
                <InfoTooltip
                  content={`The estimated amount you'll receive after estimated network costs and the max slippage setting (${swapMaxSlippage}%).`}
                  size={14}
                />
              </>
            }
          >
            <AmountWithTokenIcon>
              {swapExpectedToReceive} {buyToken}
              {swapExpectedReceiveUsd && (
                <i>
                  (<FiatAmount amount={swapExpectedReceiveUsd} />)
                </i>
              )}
            </AmountWithTokenIcon>
          </ConfirmDetailsItem>
        )}

        {swapMaxSlippage && (
          <ConfirmDetailsItem
            label={
              <>
                Max. swap slippage{' '}
                <InfoTooltip
                  content="CoW Swap dynamically adjusts your slippage tolerance to ensure your trade executes quickly while still getting the best price. Trades are protected from MEV, so your slippage can't be exploited!"
                  size={14}
                />
              </>
            }
            withTimelineDot
          >
            {swapMaxSlippage}%
          </ConfirmDetailsItem>
        )}

        {swapMinReceive && (
          <ConfirmDetailsItem
            label={
              <ReceiveAmountTitle>
                <b>Min. to receive</b>
              </ReceiveAmountTitle>
            }
          >
            <b>
              <AmountWithTokenIcon>
                <TokenLogo token={buyTokenObj} size={tokenLogoSize} />
                {swapMinReceive} {buyToken}
                {swapMinReceiveUsd && (
                  <i>
                    (<FiatAmount amount={swapMinReceiveUsd} />)
                  </i>
                )}
              </AmountWithTokenIcon>
            </b>
          </ConfirmDetailsItem>
        )}
      </SectionContent>

      <DividerHorizontal margin="8px 0 4px" />

      {/* Bridge Section Header - Can be clicked if collapsible */}
      <ClickableStopTitle
        isCollapsible={isBridgeSectionCollapsible}
        onClick={isBridgeSectionCollapsible ? onBridgeSectionToggle : undefined}
      >
        <StopNumberCircle>2</StopNumberCircle>
        <b>
          <span>Bridge via </span>
          <ProtocolIcons showOnlySecond size={21} secondProtocol={bridgeProvider} />
          <span> {bridgeProvider.title}</span>
        </b>
        {isBridgeSectionCollapsible && (
          <ToggleIconContainer>
            <ToggleArrow isOpen={isBridgeSectionExpanded}>
              <SVG src={CarretIcon} title={isBridgeSectionExpanded ? 'Close' : 'Open'} />
            </ToggleArrow>
          </ToggleIconContainer>
        )}
      </ClickableStopTitle>

      {/* Bridge Section Content - Can be collapsed */}
      <SectionContent isExpanded={isBridgeSectionExpanded}>
        <ConfirmDetailsItem label="" withTimelineDot>
          <TokenFlowContainer>
            <AmountWithTokenIcon>
              <TokenLogo token={sourceTokenObj} size={tokenLogoSize} />
              {bridgeAmount} {bridgeToken}
            </AmountWithTokenIcon>
            <ArrowIcon>→</ArrowIcon>
            <AmountWithTokenIcon>
              <TokenLogo token={destTokenObj} size={tokenLogoSize} />
              {bridgeReceiveAmount} {bridgeToken} on {recipientChainName}
              {hideBridgeFlowFiatAmount || (
                <>
                  {bridgeReceiveAmountUsd && (
                    <i>
                      (<FiatAmount amount={bridgeReceiveAmountUsd} />)
                    </i>
                  )}
                </>
              )}
            </AmountWithTokenIcon>
          </TokenFlowContainer>
        </ConfirmDetailsItem>

        <ConfirmDetailsItem
          label={
            <>
              Bridge fee <InfoTooltip content="The fee for the bridge transaction." size={14} />
            </>
          }
          withTimelineDot
          contentTextColor={getFeeTextColor(bridgeFee)}
        >
          {isFreeSwapFee(bridgeFee) ? 'FREE' : `$${bridgeFee}`}
        </ConfirmDetailsItem>

        <ConfirmDetailsItem
          label={
            <>
              Max. bridge slippage{' '}
              <InfoTooltip
                content="Your transaction will revert if the price changes unfavorably by more than this percentage."
                size={14}
              />
            </>
          }
          withTimelineDot
        >
          {maxBridgeSlippage}%
        </ConfirmDetailsItem>

        <ConfirmDetailsItem
          label={
            <>
              Est. bridge time{' '}
              <InfoTooltip content="The estimated time for the bridge transaction to complete." size={14} />
            </>
          }
          withTimelineDot
        >
          ~ {displayTime(estimatedTime * 1000, true)}
        </ConfirmDetailsItem>

        <ConfirmDetailsItem
          label={
            <ReceiveAmountTitle>
              <b>Min. to receive</b>
            </ReceiveAmountTitle>
          }
        >
          <b>
            <AmountWithTokenIcon>
              <TokenLogo token={destTokenObj} size={tokenLogoSize} />
              {bridgeReceiveAmount} {bridgeToken}
              {bridgeReceiveAmountUsd && (
                <i>
                  (<FiatAmount amount={bridgeReceiveAmountUsd} />)
                </i>
              )}
            </AmountWithTokenIcon>
          </b>
        </ConfirmDetailsItem>

        <ConfirmDetailsItem
          label={
            <>
              Recipient{' '}
              <InfoTooltip content="The address that will receive the tokens on the destination chain." size={14} />
            </>
          }
          withTimelineDot
          isLast={true}
        >
          <RecipientWrapper>
            <NetworkLogo chainId={recipientChainId} />
            {isAddress(recipient) ? (
              <Link href={getExplorerLink(recipientChainId, recipient, ExplorerDataType.ADDRESS)} target="_blank">
                {shortenAddress(recipient)} ↗
              </Link>
            ) : (
              recipient
            )}
          </RecipientWrapper>
        </ConfirmDetailsItem>
      </SectionContent>
    </Wrapper>
  )
}
