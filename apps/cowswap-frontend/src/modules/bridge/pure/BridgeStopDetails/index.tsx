import { ReactNode } from 'react'

import CheckmarkIcon from '@cowprotocol/assets/cow-swap/checkmark.svg'
import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'
import { displayTime, ExplorerDataType, getExplorerLink, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId, BridgeProviderInfo } from '@cowprotocol/cow-sdk'
import { InfoTooltip, UI } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReceiveAmountTitle } from 'modules/trade/pure/ReceiveAmountTitle'

import {
  RefundLink,
  RefundRecipientWrapper,
  StyledAnimatedTimelineRefundIcon,
  StyledTimelineCheckmarkIcon,
} from './styled'

import {
  InfoTextSpan,
  InfoTextBold,
  SuccessTextBold,
  TimelineIconCircleWrapper,
  AnimatedEllipsis,
  DangerText,
  StatusAwareText,
} from '../../styles'
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
  bridgeProvider: BridgeProviderInfo
  bridgeSendCurrencyAmount: CurrencyAmount<Currency>
  bridgeReceiveCurrencyAmount: CurrencyAmount<Currency>
  recipientChainName: string
  receiveAmountUsd: CurrencyAmount<Token> | null
  bridgeFee: CurrencyAmount<Currency>
  estimatedTime: number | undefined
  recipient: Nullish<string>
  recipientChainId: SupportedChainId
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
  receiveAmountUsd,
  bridgeFee,
  estimatedTime,
  recipient,
  recipientChainId,
  bridgeExplorerUrl,
}: BridgeStopDetailsProps): ReactNode {
  const sourceToken = bridgeSendCurrencyAmount.currency

  const isStatusMode = status !== StopStatusEnum.DEFAULT
  const isAnimationVisible = defaultExpanded && status === StopStatusEnum.PENDING

  return (
    <BridgeDetailsContainer
      status={status}
      stopNumber={2}
      statusIcon={BridgeStatusIcons[status]}
      titlePrefix={BridgeStatusTitlePrefixes[status]}
      protocolName={bridgeProvider.name}
      bridgeProvider={bridgeProvider}
      protocolIconShowOnly="second"
      isCollapsible={isCollapsible}
      defaultExpanded={defaultExpanded}
      explorerUrl={bridgeExplorerUrl}
      chainName={recipientChainName}
      sellAmount={bridgeSendCurrencyAmount}
      buyAmount={bridgeReceiveCurrencyAmount}
      buyAmountUsd={receiveAmountUsd}
    >
      <ConfirmDetailsItem
        label={
          <>
            Bridge fee <InfoTooltip content="The fee for the bridge transaction." size={14} />
          </>
        }
        withTimelineDot
        contentTextColor={bridgeFee.equalTo(0) ? `var(${UI.COLOR_GREEN})` : undefined}
      >
        {bridgeFee.equalTo(0) ? 'FREE' : <TokenAmountDisplay currencyAmount={bridgeFee} />}
      </ConfirmDetailsItem>

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

      {recipient && (
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
      )}

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
          <TokenAmountDisplay displaySymbol usdValue={receiveAmountUsd} currencyAmount={bridgeReceiveCurrencyAmount} />
        ) : (
          <b>
            <TokenAmountDisplay
              displaySymbol
              usdValue={receiveAmountUsd}
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

      {isStatusMode && recipient && status === StopStatusEnum.REFUND_COMPLETE && (
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
              <TokenAmountDisplay displaySymbol currencyAmount={bridgeSendCurrencyAmount} />
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
                displaySymbol
                usdValue={receiveAmountUsd}
                currencyAmount={bridgeReceiveCurrencyAmount}
              />
            )}
          </b>
        </ConfirmDetailsItem>
      )}
    </BridgeDetailsContainer>
  )
}
