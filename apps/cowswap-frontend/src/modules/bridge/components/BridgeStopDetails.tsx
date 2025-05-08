import { ReactNode } from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import CheckmarkIcon from '@cowprotocol/assets/cow-swap/checkmark.svg'
import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'
import SpinnerIcon from '@cowprotocol/assets/cow-swap/spinner.svg'
import { TokenWithLogo, getChainInfo } from '@cowprotocol/common-const'
import { displayTime, ExplorerDataType, getExplorerLink, isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { FiatAmount, InfoTooltip, UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled, { keyframes } from 'styled-components'

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
  StyledSpinnerIcon,
} from './styled'
import { StopStatus } from './SwapStopDetails'

import { BridgeFeeType, BridgeProtocolConfig } from '../types'

// Helper to determine text color based on status
const getStatusTextColor = (status: StopStatus | undefined): string => {
  switch (status) {
    case 'pending':
      return `var(${UI.COLOR_INFO_TEXT})`
    case 'failed':
      return `var(${UI.COLOR_DANGER_TEXT})`
    case 'done':
    case 'refund_complete':
      return `var(${UI.COLOR_SUCCESS_TEXT})`
    default:
      return `var(${UI.COLOR_TEXT})`
  }
}

const ellipsisAnimation = keyframes`
  0%, 100% {
    content: '.';
  }
  25% {
    content: '..';
  }
  50% {
    content: '...';
  }
  75% {
    content: '';
  }
`

const refundAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
`

const StatusAwareText = styled.span<{ status?: StopStatus }>`
  color: ${({ status }) => getStatusTextColor(status)};
`

const AnimatedEllipsis = styled.span`
  display: inline-block;
  width: 1.2em;
  text-align: left;
  vertical-align: bottom;

  &::after {
    content: '.';
    animation: ${ellipsisAnimation} 2s infinite steps(1);
    display: inline-block;
  }
`

const StyledRefundIcon = styled(SVG)`
  width: 16px;
  height: 16px;
  /* Let the StopNumberCircle control the colors */
  fill: currentColor;
  display: block;
  transform-origin: center;
  animation: ${refundAnimation} 3s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
`

export interface BridgeStopDetailsProps {
  isCollapsible?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  status?: StopStatus

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
  status,
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
  const isStatusMode = status && status !== 'default'

  let titlePrefix = 'Bridge via'
  if (status === 'done') {
    titlePrefix = 'Bridged via'
  } else if (status === 'pending') {
    titlePrefix = 'Bridging via'
  } else if (status === 'failed') {
    titlePrefix = 'Bridging via'
  } else if (status === 'refund_complete') {
    titlePrefix = 'Bridging via'
  }

  const TitleContent = (
    <>
      <StopNumberCircle status={status} stopNumber={2}>
        {status === 'done' && <SVG src={CheckmarkIcon} />}
        {status === 'pending' && <StyledSpinnerIcon src={SpinnerIcon} />}
        {status === 'failed' && <StyledRefundIcon src={RefundIcon} />}
        {status === 'refund_complete' && <StyledRefundIcon src={RefundIcon} />}
      </StopNumberCircle>
      <b>
        <span>{titlePrefix} </span>
        <ProtocolIcons showOnlySecond size={21} secondProtocol={bridgeProvider} />
        <span> {bridgeProvider.title}</span>
        {status === 'failed' && <span style={{ marginLeft: '4px' }}>failed</span>}
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
            isStatusMode ? (
              'Min. to receive'
            ) : (
              <ReceiveAmountTitle>
                <b>Min. to receive</b>
              </ReceiveAmountTitle>
            )
          }
          {...(isStatusMode && { withTimelineDot: true })}
        >
          {isStatusMode ? (
            <AmountWithTokenIcon>
              <TokenLogo token={destTokenObj} size={tokenLogoSize} />
              {bridgeReceiveAmount} {bridgeToken}
              {hideBridgeFlowFiatAmount ||
                (bridgeReceiveAmountUsdValue && (
                  <i>
                    (<FiatAmount amount={bridgeReceiveAmountUsdValue} />)
                  </i>
                ))}
            </AmountWithTokenIcon>
          ) : (
            <b>
              <AmountWithTokenIcon>
                <TokenLogo token={destTokenObj} size={tokenLogoSize} />
                {bridgeReceiveAmount} {bridgeToken}
                {hideBridgeFlowFiatAmount ||
                  (bridgeReceiveAmountUsdValue && (
                    <i>
                      (<FiatAmount amount={bridgeReceiveAmountUsdValue} />)
                    </i>
                  ))}
              </AmountWithTokenIcon>
            </b>
          )}
        </ConfirmDetailsItem>

        {isStatusMode && status === 'failed' && (
          <>
            <ConfirmDetailsItem
              label={<span style={{ textDecoration: 'line-through' }}>You received</span>}
              withTimelineDot={true}
            >
              <span
                style={{
                  color: `var(${UI.COLOR_DANGER_TEXT})`,
                }}
              >
                Bridging failed
              </span>
            </ConfirmDetailsItem>
            <ConfirmDetailsItem
              label={
                <ReceiveAmountTitle>
                  <b>Refunding</b>
                </ReceiveAmountTitle>
              }
            >
              <span style={{ color: `var(${UI.COLOR_ALERT_TEXT})` }}>Refund started</span>
            </ConfirmDetailsItem>
          </>
        )}

        {isStatusMode && status === 'refund_complete' && (
          <>
            <ConfirmDetailsItem
              label={<span style={{ textDecoration: 'line-through' }}>You received</span>}
              withTimelineDot={true}
            >
              <span
                style={{
                  color: `var(${UI.COLOR_DANGER_TEXT})`,
                }}
              >
                Bridging failed
              </span>
            </ConfirmDetailsItem>
            <ConfirmDetailsItem
              label={
                <ReceiveAmountTitle>
                  <b>Refunded</b>
                </ReceiveAmountTitle>
              }
            >
              <AmountWithTokenIcon>
                <TokenLogo token={sourceTokenObj} size={tokenLogoSize} />
                {bridgeAmount} {bridgeToken}
                {hideBridgeFlowFiatAmount ||
                  (bridgeReceiveAmountUsdValue && (
                    <i>
                      (<FiatAmount amount={bridgeReceiveAmountUsdValue} />)
                    </i>
                  ))}
              </AmountWithTokenIcon>
            </ConfirmDetailsItem>
          </>
        )}

        {isStatusMode && status !== 'failed' && status !== 'refund_complete' && (
          <ConfirmDetailsItem
            label={
              <ReceiveAmountTitle>
                <b>You received</b>
              </ReceiveAmountTitle>
            }
          >
            <b>
              {status === 'pending' && (
                <StatusAwareText status={status}>
                  in progress
                  <AnimatedEllipsis />
                </StatusAwareText>
              )}
              {status === 'done' && (
                <AmountWithTokenIcon>
                  <TokenLogo token={destTokenObj} size={tokenLogoSize} />
                  {bridgeReceiveAmount} {bridgeToken}
                  {hideBridgeFlowFiatAmount ||
                    (bridgeReceiveAmountUsdValue && (
                      <i>
                        (<FiatAmount amount={bridgeReceiveAmountUsdValue} />)
                      </i>
                    ))}
                </AmountWithTokenIcon>
              )}
            </b>
          </ConfirmDetailsItem>
        )}

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
