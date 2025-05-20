import { ReactNode } from 'react'

import CheckmarkIcon from '@cowprotocol/assets/cow-swap/checkmark.svg'
import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'
import { displayTime, ExplorerDataType, getExplorerLink, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { InfoTooltip, UI } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReceiveAmountTitle } from 'modules/trade/pure/ReceiveAmountTitle'

import {
  RefundLink,
  RefundRecipientWrapper,
  StyledAnimatedTimelineRefundIcon,
  StyledTimelineCheckmarkIcon,
} from './styled'

import {
  ArrowIcon,
  TokenFlowContainer,
  InfoTextSpan,
  InfoTextBold,
  SuccessTextBold,
  TimelineIconCircleWrapper,
  AnimatedEllipsis,
  DangerText,
  StatusAwareText,
} from '../../styles'
import { BridgeProtocolConfig } from '../../types'
import { StopStatusEnum } from '../../utils/status'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { NetworkLogo } from '../NetworkLogo'
import { RecipientDisplay } from '../RecipientDisplay'
import { BridgeStatusIcons, BridgeStatusTitlePrefixes } from '../StopStatus'
import { TokenAmountDisplay } from '../TokenAmountDisplay'

export interface BridgeStopDetailsProps {
  isCollapsible?: boolean
  defaultExpanded?: boolean
  status?: StopStatusEnum
  bridgeProvider: BridgeProtocolConfig
  bridgeSendCurrencyAmount: CurrencyAmount<Currency>
  bridgeReceiveCurrencyAmount: CurrencyAmount<Currency>
  recipientChainName: string
  hideBridgeFlowFiatAmount: boolean
  receiveAmountUsd: CurrencyAmount<Token> | null
  bridgeFee: CurrencyAmount<Currency>
  maxBridgeSlippage?: string
  estimatedTime: number | undefined
  recipient: string
  recipientChainId: SupportedChainId
  tokenLogoSize: number
  bridgeExplorerUrl?: string
}

export function BridgeStopDetails({
  isCollapsible = false,
  defaultExpanded = true,
  status = StopStatusEnum.DEFAULT,
  bridgeProvider,
  bridgeSendCurrencyAmount,
  bridgeReceiveCurrencyAmount,
  recipientChainName,
  hideBridgeFlowFiatAmount,
  receiveAmountUsd,
  bridgeFee,
  maxBridgeSlippage,
  estimatedTime,
  recipient,
  recipientChainId,
  tokenLogoSize,
  bridgeExplorerUrl,
}: BridgeStopDetailsProps): ReactNode {
  const sourceToken = bridgeSendCurrencyAmount.currency
  const bridgeTokenSymbol = sourceToken.symbol || '???'

  const destToken = bridgeReceiveCurrencyAmount.currency
  const bridgeReceiveTokenSymbol = destToken.symbol || '???'

  const isStatusMode = status !== StopStatusEnum.DEFAULT
  const isAnimationVisible = defaultExpanded && status === StopStatusEnum.PENDING

  return (
    <BridgeDetailsContainer
      status={status}
      stopNumber={2}
      statusIcon={BridgeStatusIcons[status]}
      titlePrefix={BridgeStatusTitlePrefixes[status]}
      protocolName={bridgeProvider.title}
      bridgeProvider={bridgeProvider}
      protocolIconShowOnly="second"
      isCollapsible={isCollapsible}
      defaultExpanded={defaultExpanded}
      explorerUrl={bridgeExplorerUrl}
    >
      <ConfirmDetailsItem label="" withTimelineDot>
        <TokenFlowContainer>
          <TokenAmountDisplay
            token={sourceToken}
            displaySymbol={bridgeTokenSymbol}
            tokenLogoSize={tokenLogoSize}
            hideFiatAmount={true}
            currencyAmount={bridgeSendCurrencyAmount}
          />
          <ArrowIcon>→</ArrowIcon>
          <TokenAmountDisplay
            token={destToken}
            displaySymbol={bridgeReceiveTokenSymbol}
            usdValue={receiveAmountUsd}
            hideFiatAmount={hideBridgeFlowFiatAmount}
            tokenLogoSize={tokenLogoSize}
            currencyAmount={bridgeReceiveCurrencyAmount}
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
        contentTextColor={bridgeFee.equalTo(0) ? `var(${UI.COLOR_GREEN})` : undefined}
      >
        {bridgeFee.equalTo(0) ? (
          'FREE'
        ) : (
          <TokenAmountDisplay token={bridgeFee.currency} currencyAmount={bridgeFee} tokenLogoSize={tokenLogoSize} />
        )}
      </ConfirmDetailsItem>

      {maxBridgeSlippage && (
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
      )}

      {estimatedTime && (
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
      )}

      <ConfirmDetailsItem
        label={
          <>
            Recipient{' '}
            <InfoTooltip content="The address that will receive the tokens on the destination chain." size={14} />
          </>
        }
        withTimelineDot
      >
        <RecipientDisplay recipient={recipient} chainId={recipientChainId} logoSize={16} />
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
            displaySymbol={bridgeReceiveTokenSymbol}
            usdValue={receiveAmountUsd}
            tokenLogoSize={tokenLogoSize}
            currencyAmount={bridgeReceiveCurrencyAmount}
          />
        ) : (
          <b>
            <TokenAmountDisplay
              token={destToken}
              displaySymbol={bridgeReceiveTokenSymbol}
              usdValue={receiveAmountUsd}
              tokenLogoSize={tokenLogoSize}
              currencyAmount={bridgeReceiveCurrencyAmount}
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
              <AnimatedEllipsis isVisible={isAnimationVisible} />
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
                displaySymbol={bridgeTokenSymbol}
                hideFiatAmount={true}
                tokenLogoSize={tokenLogoSize}
                currencyAmount={bridgeSendCurrencyAmount}
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
                <AnimatedEllipsis isVisible={isAnimationVisible} />
              </StatusAwareText>
            )}
            {status === StopStatusEnum.DONE && (
              <TokenAmountDisplay
                token={destToken}
                displaySymbol={bridgeReceiveTokenSymbol}
                usdValue={receiveAmountUsd}
                tokenLogoSize={tokenLogoSize}
                currencyAmount={bridgeReceiveCurrencyAmount}
              />
            )}
          </b>
        </ConfirmDetailsItem>
      )}
    </BridgeDetailsContainer>
  )
}
