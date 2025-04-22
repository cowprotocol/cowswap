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
}

/**
 * BridgeRouteBreakdown component displays the details of a bridge transaction
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

  return (
    <Wrapper>
      <RouteHeader>
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
        <StopsInfo>
          2 stops
          <ProtocolIcons secondProtocol={bridgeProvider} />
        </StopsInfo>
      </RouteHeader>

      <StopTitle>
        <StopNumberCircle>1</StopNumberCircle>
        <b>
          <span>Swap on </span>
          <ProtocolIcons showOnlyFirst size={21} secondProtocol={bridgeProvider} />
          <span> CoW Protocol</span>
        </b>
      </StopTitle>

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

      <DividerHorizontal margin="8px 0 4px" />

      <StopTitle>
        <StopNumberCircle>2</StopNumberCircle>
        <b>
          <span>Bridge via </span>
          <ProtocolIcons showOnlySecond size={21} secondProtocol={bridgeProvider} />
          <span> {bridgeProvider.title}</span>
        </b>
      </StopTitle>

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
    </Wrapper>
  )
}
