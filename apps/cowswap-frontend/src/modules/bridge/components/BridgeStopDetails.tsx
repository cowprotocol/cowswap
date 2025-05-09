import { ReactNode } from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import CheckmarkIcon from '@cowprotocol/assets/cow-swap/checkmark.svg'
import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'
import SpinnerIcon from '@cowprotocol/assets/cow-swap/spinner.svg'
import CLOSE_ICON_X from '@cowprotocol/assets/cow-swap/x.svg'
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
import { StopStatusEnum } from './SwapStopDetails'

import { BridgeFeeType, BridgeProtocolConfig } from '../types'

// Helper to determine text color based on status
const getStatusTextColor = (status: StopStatusEnum | undefined): string => {
  switch (status) {
    case StopStatusEnum.PENDING:
      return `var(${UI.COLOR_INFO_TEXT})`
    case StopStatusEnum.FAILED:
      return `var(${UI.COLOR_DANGER_TEXT})`
    case StopStatusEnum.DONE:
    case StopStatusEnum.REFUND_COMPLETE:
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

const refundCompleteAnimation = keyframes`
  0% {
    transform: rotate(0deg) scale(1);
    animation-timing-function: ease-in;
  }
  30% {
    transform: rotate(-720deg) scale(1);
    animation-timing-function: ease-out;
  }
  85% {
    transform: rotate(-1080deg) scale(1.15);
    animation-timing-function: ease-in;
  }
  100% {
    transform: rotate(-1080deg) scale(1);
  }
`

const StatusAwareText = styled.span<{ status?: StopStatusEnum }>`
  color: ${({ status }) => getStatusTextColor(status)};
`

const AnimatedEllipsis = styled.span`
  display: inline-block;
  width: 0.8em;
  text-align: left;
  vertical-align: bottom;

  &::after {
    content: '.';
    animation: ${ellipsisAnimation} 2s infinite steps(1);
    display: inline-block;
  }
`

export const StyledRefundCompleteIcon = styled(SVG)`
  width: 16px;
  height: 16px;
  fill: currentColor;
  display: block;
  transform-origin: center;
  animation: ${refundCompleteAnimation} 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
`

const StyledAnimatedTimelineRefundIcon = styled(SVG)`
  width: 14px;
  height: 14px;
  fill: currentColor;
  display: block;
  transform-origin: center;
  animation: ${refundAnimation} 3s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
`

const TimelineIconCircleWrapper = styled.span`
  --size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  padding: 3px;
`

const DangerText = styled.span`
  color: var(${UI.COLOR_DANGER_TEXT});
`

export interface BridgeStopDetailsProps {
  isCollapsible?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  status?: StopStatusEnum

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

// Helper function to render the status icon for BridgeStop
function renderBridgeStopStatusIcon(status?: StopStatusEnum): React.ReactElement | null {
  switch (status) {
    case StopStatusEnum.DONE:
      return (
        <SVG src={CheckmarkIcon} style={{ width: '24px', height: '18px', color: `var(${UI.COLOR_SUCCESS_TEXT})` }} />
      )
    case StopStatusEnum.PENDING:
      return <StyledSpinnerIcon src={SpinnerIcon} />
    case StopStatusEnum.FAILED:
    case StopStatusEnum.REFUND_COMPLETE:
      return <SVG src={CLOSE_ICON_X} style={{ color: `var(${UI.COLOR_DANGER_TEXT})` }} />
    default:
      return null
  }
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
  const isStatusMode = status && status !== StopStatusEnum.DEFAULT

  let titleActionText: string
  switch (status) {
    case StopStatusEnum.DONE:
      titleActionText = 'Bridged via'
      break
    case StopStatusEnum.PENDING:
      titleActionText = 'Bridging via'
      break
    case StopStatusEnum.FAILED:
    case StopStatusEnum.REFUND_COMPLETE:
      titleActionText = 'Bridge failed on'
      break
    default:
      titleActionText = 'Bridge via'
      break
  }

  const TitleContent = (
    <>
      <StopNumberCircle status={status} stopNumber={2}>
        {renderBridgeStopStatusIcon(status)}
      </StopNumberCircle>
      <b>
        <span>{titleActionText} </span>
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

        <ConfirmDetailsItem
          label={
            <>
              Recipient{' '}
              <InfoTooltip content="The address that will receive the tokens on the destination chain." size={14} />
            </>
          }
          withTimelineDot
          isLast={!isStatusMode}
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

        {isStatusMode && status === StopStatusEnum.FAILED && (
          <>
            <ConfirmDetailsItem label="You received" withTimelineDot={true}>
              <DangerText>Bridging failed</DangerText>
            </ConfirmDetailsItem>
            <ConfirmDetailsItem
              label={
                <ReceiveAmountTitle
                  icon={
                    <StyledAnimatedTimelineRefundIcon
                      src={RefundIcon}
                      style={{ color: `var(${UI.COLOR_INFO_TEXT})` }}
                    />
                  }
                >
                  <span style={{ color: `var(${UI.COLOR_INFO_TEXT})` }}>
                    <b>Refunding</b>
                  </span>
                </ReceiveAmountTitle>
              }
            >
              <b style={{ color: `var(${UI.COLOR_INFO_TEXT})` }}>
                Refund started
                <AnimatedEllipsis />
              </b>
            </ConfirmDetailsItem>
          </>
        )}

        {isStatusMode && status === StopStatusEnum.REFUND_COMPLETE && (
          <>
            <ConfirmDetailsItem label="You received" withTimelineDot={true}>
              <DangerText>Bridging failed</DangerText>
            </ConfirmDetailsItem>
            <ConfirmDetailsItem
              label={
                <ReceiveAmountTitle
                  icon={
                    <TimelineIconCircleWrapper style={{ backgroundColor: `var(${UI.COLOR_SUCCESS_BG})` }}>
                      <SVG
                        src={CheckmarkIcon}
                        style={{ width: '14px', height: '14px', color: `var(${UI.COLOR_SUCCESS_TEXT})` }}
                      />
                    </TimelineIconCircleWrapper>
                  }
                >
                  <b style={{ color: `var(${UI.COLOR_SUCCESS_TEXT})` }}>Refunded</b>
                </ReceiveAmountTitle>
              }
            >
              <b>
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
              </b>
            </ConfirmDetailsItem>
          </>
        )}

        {isStatusMode && status !== StopStatusEnum.FAILED && status !== StopStatusEnum.REFUND_COMPLETE && (
          <ConfirmDetailsItem
            label={
              <ReceiveAmountTitle>
                <b>You received</b>
              </ReceiveAmountTitle>
            }
          >
            <b>
              {status === StopStatusEnum.PENDING && (
                <StatusAwareText status={status}>
                  in progress
                  <AnimatedEllipsis />
                </StatusAwareText>
              )}
              {status === StopStatusEnum.DONE && (
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
