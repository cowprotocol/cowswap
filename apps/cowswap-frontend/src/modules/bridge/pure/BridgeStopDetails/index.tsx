import { ReactNode } from 'react'

import CheckmarkIcon from '@cowprotocol/assets/cow-swap/checkmark.svg'
import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'
import SpinnerIconAsset from '@cowprotocol/assets/cow-swap/spinner.svg'
import CLOSE_ICON_X from '@cowprotocol/assets/cow-swap/x.svg'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { displayTime, ExplorerDataType, getExplorerLink, isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { InfoTooltip } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReceiveAmountTitle } from 'modules/trade/pure/ReceiveAmountTitle'
import { UsdAmountInfo } from 'modules/usdAmount/hooks/useUsdAmount'

import {
  RefundLink,
  RefundRecipientWrapper,
  StyledAnimatedTimelineRefundIcon,
  StyledStatusCheckmarkIcon,
  StyledStatusCloseIcon,
  StyledTimelineCheckmarkIcon,
} from './styled'

import {
  ArrowIcon,
  Link,
  SectionContent,
  TokenFlowContainer,
  InfoTextSpan,
  InfoTextBold,
  SuccessTextBold,
  RecipientWrapper,
  TimelineIconCircleWrapper,
  StyledSpinnerIcon,
  AnimatedEllipsis,
  DangerText,
  StatusAwareText,
} from '../../styles'
import { BridgeFeeType, BridgeProtocolConfig } from '../../types'
import { getFeeTextColor, isFreeSwapFee } from '../../utils/fees'
import { StopStatusEnum } from '../../utils/status'
import { NetworkLogo } from '../NetworkLogo'
import { StopHeader } from '../StopHeader/StopHeader'
import { TokenAmountDisplay } from '../TokenAmountDisplay'

const CloseIcon = <StyledStatusCloseIcon src={CLOSE_ICON_X} />

const BridgeStopStatusIcons: Record<StopStatusEnum, ReactNode> = {
  [StopStatusEnum.DONE]: <StyledStatusCheckmarkIcon src={CheckmarkIcon} />,
  [StopStatusEnum.PENDING]: <StyledSpinnerIcon src={SpinnerIconAsset} />,
  [StopStatusEnum.FAILED]: CloseIcon,
  [StopStatusEnum.REFUND_COMPLETE]: CloseIcon,
  [StopStatusEnum.DEFAULT]: null,
}

const bridgeFailedTitle = 'Bridge failed on'

const ActionTitles: Record<StopStatusEnum, string> = {
  [StopStatusEnum.DONE]: 'Bridged via',
  [StopStatusEnum.PENDING]: 'Bridging via',
  [StopStatusEnum.FAILED]: bridgeFailedTitle,
  [StopStatusEnum.REFUND_COMPLETE]: bridgeFailedTitle,
  [StopStatusEnum.DEFAULT]: 'Bridge via',
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
  bridgeExplorerUrl?: string
}

export function BridgeStopDetails({
  isCollapsible = false,
  isExpanded = true,
  onToggle = () => {},
  status = StopStatusEnum.DEFAULT,
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
  bridgeExplorerUrl,
}: BridgeStopDetailsProps): ReactNode {
  const sourceToken = bridgeSendCurrencyAmount.currency
  const bridgeAmount = bridgeSendCurrencyAmount.toSignificant(6)
  const bridgeTokenSymbol = sourceToken.symbol || '???'

  const destToken = bridgeReceiveCurrencyAmount.currency
  const bridgeReceiveAmount = bridgeReceiveCurrencyAmount.toSignificant(6)
  const bridgeReceiveTokenSymbol = destToken.symbol || '???'

  const bridgeReceiveAmountUsdValue = bridgeReceiveAmountUsdResult?.value
  const isStatusMode = status !== StopStatusEnum.DEFAULT

  return (
    <>
      <StopHeader
        status={status}
        stopNumber={2}
        statusIcons={BridgeStopStatusIcons}
        statusTitlePrefix={ActionTitles[status]}
        protocolName={bridgeProvider.title}
        protocolIconSize={21}
        protocolIconShowOnly="second"
        protocolIconBridgeProvider={bridgeProvider}
        isCollapsible={isCollapsible}
        isExpanded={isExpanded}
        onToggle={onToggle}
        explorerUrl={bridgeExplorerUrl}
      />

      <SectionContent isExpanded={isExpanded}>
        <ConfirmDetailsItem label="" withTimelineDot>
          <TokenFlowContainer>
            <TokenAmountDisplay
              token={sourceToken}
              amount={bridgeAmount}
              displaySymbol={bridgeTokenSymbol}
              tokenLogoSize={tokenLogoSize}
              hideFiatAmount={true}
            />
            <ArrowIcon>→</ArrowIcon>
            <TokenAmountDisplay
              token={destToken}
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
              token={destToken}
              amount={bridgeReceiveAmount}
              displaySymbol={bridgeReceiveTokenSymbol}
              usdValue={bridgeReceiveAmountUsdValue}
              hideFiatAmount={hideBridgeFlowFiatAmount}
              tokenLogoSize={tokenLogoSize}
            />
          ) : (
            <b>
              <TokenAmountDisplay
                token={destToken}
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
            <ConfirmDetailsItem label="You received" withTimelineDot>
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
                  <SuccessTextBold>Refunded to</SuccessTextBold>
                  <RefundRecipientWrapper>
                    <NetworkLogo chainId={sourceToken.chainId as SupportedChainId} size={16} />
                    <b>
                      <RefundLink
                        href={getExplorerLink(
                          sourceToken.chainId as SupportedChainId,
                          recipient,
                          ExplorerDataType.ADDRESS,
                        )}
                        target="_blank"
                        underline
                      >
                        {shortenAddress(recipient)} ↗
                      </RefundLink>
                    </b>
                  </RefundRecipientWrapper>
                </ReceiveAmountTitle>
              }
            >
              <b>
                <TokenAmountDisplay
                  token={sourceToken}
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
                  token={destToken}
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
