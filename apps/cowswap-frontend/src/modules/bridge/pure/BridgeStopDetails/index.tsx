import { ReactNode } from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import CheckmarkIcon from '@cowprotocol/assets/cow-swap/checkmark.svg'
import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'
import SpinnerIconAsset from '@cowprotocol/assets/cow-swap/spinner.svg'
import CLOSE_ICON_X from '@cowprotocol/assets/cow-swap/x.svg'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { displayTime, ExplorerDataType, getExplorerLink, isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { InfoTooltip } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReceiveAmountTitle } from 'modules/trade/pure/ReceiveAmountTitle'
import { UsdAmountInfo } from 'modules/usdAmount/hooks/useUsdAmount'

import { ProtocolIcons } from 'common/pure/ProtocolIcons'

import {
  AnimatedEllipsis,
  DangerText,
  InfoTextBold,
  InfoTextSpan,
  RecipientWrapper,
  RefundLink,
  RefundRecipientWrapper,
  RefundSuccessTextBold,
  StatusAwareText,
  StyledAnimatedTimelineRefundIcon,
  StyledRefundCompleteIcon as LocalStyledRefundCompleteIcon,
  StyledStatusCheckmarkIcon,
  StyledStatusCloseIcon,
  StyledTimelineCheckmarkIcon,
  SuccessTextBold,
  TimelineIconCircleWrapper,
} from './styled'

import {
  ArrowIcon,
  ClickableStopTitle,
  Link,
  SectionContent,
  StopNumberCircle,
  StopTitle,
  StyledSpinnerIcon,
  ToggleArrow,
  ToggleIconContainer,
  TokenFlowContainer,
} from '../../styles'
import { BridgeFeeType, BridgeProtocolConfig } from '../../types'
import { getFeeTextColor, isFreeSwapFee } from '../../utils/fees'
import { StopStatusEnum } from '../../utils/status'
import { NetworkLogo } from '../NetworkLogo'
import { TokenAmountDisplay } from '../TokenAmountDisplay'

// Re-export for SwapStopDetails
export { LocalStyledRefundCompleteIcon as StyledRefundCompleteIcon }

function renderBridgeStopStatusIcon(status?: StopStatusEnum): React.ReactElement | null {
  switch (status) {
    case StopStatusEnum.DONE:
      return <StyledStatusCheckmarkIcon src={CheckmarkIcon} />
    case StopStatusEnum.PENDING:
      return <StyledSpinnerIcon src={SpinnerIconAsset} />
    case StopStatusEnum.FAILED:
    case StopStatusEnum.REFUND_COMPLETE:
      return <StyledStatusCloseIcon src={CLOSE_ICON_X} />
    default:
      return null
  }
}

export interface BridgeStopDetailsProps {
  isCollapsible?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  status?: StopStatusEnum

  bridgeProvider: BridgeProtocolConfig
  bridgeSendCurrencyAmount: CurrencyAmount<TokenWithLogo>
  bridgeReceiveCurrencyAmount: CurrencyAmount<TokenWithLogo>
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
  bridgeSendCurrencyAmount,
  bridgeReceiveCurrencyAmount,
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
  const sourceTokenObj = bridgeSendCurrencyAmount.currency
  const bridgeAmount = bridgeSendCurrencyAmount.toSignificant(6)
  const bridgeTokenSymbol = sourceTokenObj.symbol || '???'

  const destTokenObj = bridgeReceiveCurrencyAmount.currency
  const bridgeReceiveAmount = bridgeReceiveCurrencyAmount.toSignificant(6)
  const bridgeReceiveTokenSymbol = destTokenObj.symbol || '???'

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
            <TokenAmountDisplay
              token={sourceTokenObj}
              amount={bridgeAmount}
              displaySymbol={bridgeTokenSymbol}
              tokenLogoSize={tokenLogoSize}
              hideFiatAmount={true}
            />
            <ArrowIcon>→</ArrowIcon>
            <TokenAmountDisplay
              token={destTokenObj}
              amount={bridgeReceiveAmount}
              displaySymbol={bridgeReceiveTokenSymbol}
              usdValue={bridgeReceiveAmountUsdValue}
              hideFiatAmount={hideBridgeFlowFiatAmount}
              tokenLogoSize={tokenLogoSize}
            />
            {` on ${recipientChainName}`}
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
            <>
              Recipient{' '}
              <InfoTooltip content="The address that will receive the tokens on the destination chain." size={14} />
            </>
          }
          withTimelineDot
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
          isLast={!isStatusMode}
        >
          {isStatusMode ? (
            <TokenAmountDisplay
              token={destTokenObj}
              amount={bridgeReceiveAmount}
              displaySymbol={bridgeReceiveTokenSymbol}
              usdValue={bridgeReceiveAmountUsdValue}
              hideFiatAmount={hideBridgeFlowFiatAmount}
              tokenLogoSize={tokenLogoSize}
            />
          ) : (
            <b>
              <TokenAmountDisplay
                token={destTokenObj}
                amount={bridgeReceiveAmount}
                displaySymbol={bridgeReceiveTokenSymbol}
                usdValue={bridgeReceiveAmountUsdValue}
                hideFiatAmount={hideBridgeFlowFiatAmount}
                tokenLogoSize={tokenLogoSize}
              />
            </b>
          )}
        </ConfirmDetailsItem>

        {isStatusMode && status === StopStatusEnum.FAILED && (
          <>
            <ConfirmDetailsItem label="You received" withTimelineDot={true}>
              <DangerText>Bridging failed</DangerText>
            </ConfirmDetailsItem>
            <ConfirmDetailsItem
              label={
                <ReceiveAmountTitle icon={<StyledAnimatedTimelineRefundIcon src={RefundIcon} />}>
                  <InfoTextSpan>
                    <b>Refunding</b>
                  </InfoTextSpan>
                </ReceiveAmountTitle>
              }
            >
              <InfoTextBold>
                Refund started
                <AnimatedEllipsis />
              </InfoTextBold>
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
                    <TimelineIconCircleWrapper>
                      <StyledTimelineCheckmarkIcon src={CheckmarkIcon} />
                    </TimelineIconCircleWrapper>
                  }
                >
                  <RefundSuccessTextBold>
                    Refunded to{' '}
                    <RefundRecipientWrapper>
                      <NetworkLogo chainId={sourceTokenObj.chainId as SupportedChainId} size={16} />
                      <RefundLink
                        href={getExplorerLink(
                          sourceTokenObj.chainId as SupportedChainId,
                          recipient,
                          ExplorerDataType.ADDRESS,
                        )}
                        target="_blank"
                        underline
                      >
                        {shortenAddress(recipient)} ↗
                      </RefundLink>
                    </RefundRecipientWrapper>
                  </RefundSuccessTextBold>
                </ReceiveAmountTitle>
              }
            >
              <b>
                <TokenAmountDisplay
                  token={sourceTokenObj}
                  amount={bridgeAmount}
                  displaySymbol={bridgeTokenSymbol}
                  hideFiatAmount={true}
                  tokenLogoSize={tokenLogoSize}
                />
              </b>
            </ConfirmDetailsItem>
          </>
        )}

        {isStatusMode && status !== StopStatusEnum.FAILED && status !== StopStatusEnum.REFUND_COMPLETE && (
          <ConfirmDetailsItem
            label={
              <ReceiveAmountTitle variant={status === StopStatusEnum.DONE ? 'success' : undefined}>
                {status === StopStatusEnum.DONE ? <SuccessTextBold>You received</SuccessTextBold> : <b>You received</b>}
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
                <TokenAmountDisplay
                  token={destTokenObj}
                  amount={bridgeReceiveAmount}
                  displaySymbol={bridgeReceiveTokenSymbol}
                  usdValue={bridgeReceiveAmountUsdValue}
                  hideFiatAmount={hideBridgeFlowFiatAmount}
                  tokenLogoSize={tokenLogoSize}
                />
              )}
            </b>
          </ConfirmDetailsItem>
        )}
      </SectionContent>
    </>
  )
}
