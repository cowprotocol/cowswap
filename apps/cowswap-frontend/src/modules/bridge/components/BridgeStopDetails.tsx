import { ReactNode } from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import { TokenWithLogo, getChainInfo } from '@cowprotocol/common-const'
import { displayTime, ExplorerDataType, getExplorerLink, isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { FiatAmount, InfoTooltip } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReceiveAmountTitle } from 'modules/trade/pure/ReceiveAmountTitle'
import { UsdAmountInfo } from 'modules/usdAmount/hooks/useUsdAmount'

import { ProtocolIcons } from 'common/pure/ProtocolIcons'

import { getFeeTextColor, isFreeSwapFee } from './BridgeRouteBreakdown'
import {
  AmountWithTokenIcon,
  ArrowIcon,
  Link,
  NetworkLogoWrapper,
  RecipientWrapper,
  StopNumberCircle,
  StopTitle,
  TokenFlowContainer,
  ClickableStopTitle,
  ToggleArrow,
  ToggleIconContainer,
  SectionContent,
} from './styled'

import { BridgeFeeType, BridgeProtocolConfig } from '../types'

export interface BridgeStopDetailsProps {
  isCollapsible?: boolean
  isExpanded?: boolean
  onToggle?: () => void

  bridgeProvider: BridgeProtocolConfig
  sourceTokenObj: TokenWithLogo
  destTokenObj: TokenWithLogo
  bridgeAmount: string
  bridgeToken: string
  bridgeReceiveAmount: string
  recipientChainName: string
  hideBridgeFlowFiatAmount: boolean
  bridgeReceiveAmountUsdResult?: UsdAmountInfo | null
  bridgeFee: string | BridgeFeeType
  maxBridgeSlippage: string
  estimatedTime: number
  recipient: string
  recipientChainId: SupportedChainId
  tokenLogoSize: number
}

export function BridgeStopDetails({
  isCollapsible = false,
  isExpanded = true,
  onToggle = () => {},
  bridgeProvider,
  sourceTokenObj,
  destTokenObj,
  bridgeAmount,
  bridgeToken,
  bridgeReceiveAmount,
  recipientChainName,
  hideBridgeFlowFiatAmount,
  bridgeReceiveAmountUsdResult,
  bridgeFee,
  maxBridgeSlippage,
  estimatedTime,
  recipient,
  recipientChainId,
  tokenLogoSize,
}: BridgeStopDetailsProps): ReactNode {
  const bridgeReceiveAmountUsdValue = bridgeReceiveAmountUsdResult?.value

  const TitleContent = (
    <>
      <StopNumberCircle>2</StopNumberCircle>
      <b>
        <span>Bridge via </span>
        <ProtocolIcons showOnlySecond size={21} secondProtocol={bridgeProvider} />
        <span> {bridgeProvider.title}</span>
      </b>
      {isCollapsible && (
        <ToggleIconContainer>
          <ToggleArrow isOpen={isExpanded}>
            <SVG src={CarretIcon} title={isExpanded ? 'Close' : 'Open'} />
          </ToggleArrow>
        </ToggleIconContainer>
      )}
    </>
  )

  return (
    <>
      {isCollapsible ? (
        <ClickableStopTitle isCollapsible={true} onClick={onToggle}>
          {TitleContent}
        </ClickableStopTitle>
      ) : (
        <StopTitle>{TitleContent}</StopTitle>
      )}

      <SectionContent isExpanded={isExpanded}>
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
                  {bridgeReceiveAmountUsdValue && (
                    <i>
                      (<FiatAmount amount={bridgeReceiveAmountUsdValue} />)
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
              {bridgeReceiveAmountUsdValue && (
                <i>
                  (<FiatAmount amount={bridgeReceiveAmountUsdValue} />)
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
            <NetworkLogo chainId={recipientChainId} size={16} />
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
    </>
  )
}

function NetworkLogo({ chainId, size = 16 }: { chainId: SupportedChainId; size?: number }) {
  const chainInfo = getChainInfo(chainId)
  const logoUrl = chainInfo.logo.light

  return (
    <NetworkLogoWrapper size={size}>
      <img src={logoUrl} alt={`${chainInfo.label} network logo`} />
    </NetworkLogoWrapper>
  )
}
