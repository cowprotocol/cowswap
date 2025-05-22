import { ReactNode } from 'react'

import PlusIcon from '@cowprotocol/assets/cow-swap/plus.svg'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId, BridgeProviderInfo } from '@cowprotocol/cow-sdk'
import { InfoTooltip, PercentDisplay } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'

import type { SolverCompetition } from 'modules/orderProgressBar'
import { ReceiveAmountInfo, TradeFeesAndCosts } from 'modules/trade'
import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReceiveAmountTitle } from 'modules/trade/pure/ReceiveAmountTitle'
import { UsdAmountInfo } from 'modules/usdAmount/hooks/useUsdAmount'

import { WinningSolverContainer } from './styled'

import {
  SuccessTextBold,
  TimelineIconCircleWrapper,
  StyledTimelinePlusIcon,
  StatusAwareText,
  AnimatedEllipsis,
} from '../../styles'
import { StatusColor, StopStatusEnum } from '../../utils'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { RecipientDisplay } from '../RecipientDisplay'
import { RouteTitle } from '../RouteTitle'
import { SwapStatusIcons, SwapStatusTitlePrefixes } from '../StopStatus'
import { TokenAmountDisplay } from '../TokenAmountDisplay'

export interface SwapStopDetailsProps {
  isCollapsible?: boolean
  defaultExpanded?: boolean
  status?: StopStatusEnum

  receiveAmountInfo: ReceiveAmountInfo

  sellCurrencyAmount: CurrencyAmount<Currency>
  buyCurrencyAmount: CurrencyAmount<Currency>
  sourceChainName: string
  swapExpectedReceiveUsdInfo?: UsdAmountInfo | null
  swapSlippage: Percent
  swapMinReceiveAmount?: CurrencyAmount<Currency>
  swapMinReceiveUsdInfo?: UsdAmountInfo | null
  bridgeProvider: BridgeProviderInfo
  recipient?: Nullish<string>
  sourceChainId: SupportedChainId
  winningSolver?: SolverCompetition | null
  receivedAmount?: CurrencyAmount<TokenWithLogo> | null
  receivedAmountUsdInfo?: UsdAmountInfo | null
  surplusAmount?: CurrencyAmount<TokenWithLogo> | null
  surplusAmountUsdInfo?: UsdAmountInfo | null
  swapExplorerUrl?: string
}

export function SwapStopDetails({
  isCollapsible = false,
  defaultExpanded = true,
  status = StopStatusEnum.DEFAULT,
  receiveAmountInfo,
  sellCurrencyAmount,
  buyCurrencyAmount,
  sourceChainName,
  swapExpectedReceiveUsdInfo,
  swapSlippage,
  swapMinReceiveAmount,
  swapMinReceiveUsdInfo,
  bridgeProvider,
  recipient,
  sourceChainId,
  winningSolver = null,
  receivedAmount = null,
  receivedAmountUsdInfo = null,
  surplusAmount = null,
  surplusAmountUsdInfo = null,
  swapExplorerUrl,
}: SwapStopDetailsProps): ReactNode {
  const swapExpectedReceiveUsdValue = swapExpectedReceiveUsdInfo?.value
  const swapMinReceiveUsdValue = swapMinReceiveUsdInfo?.value
  const receivedAmountUsdValue = receivedAmountUsdInfo?.value
  const surplusAmountUsdValue = surplusAmountUsdInfo?.value

  const isBridgeStatusView = winningSolver !== null || receivedAmount !== null
  const shouldShowReceivedSection = isBridgeStatusView
    ? receivedAmount !== null
    : status === StopStatusEnum.DONE && receivedAmount !== null

  const isAnimationVisible = defaultExpanded && (status === StopStatusEnum.PENDING || status === StopStatusEnum.FAILED)

  const slippagePercentDisplay = <PercentDisplay percent={swapSlippage.toFixed(2)} />

  return (
    <BridgeDetailsContainer
      status={status}
      stopNumber={1}
      statusIcon={SwapStatusIcons[status]}
      titlePrefix={SwapStatusTitlePrefixes[status]}
      protocolName="CoW Protocol"
      bridgeProvider={bridgeProvider}
      protocolIconShowOnly="first"
      protocolIconSize={21}
      isCollapsible={isCollapsible}
      defaultExpanded={defaultExpanded}
      explorerUrl={swapExplorerUrl}
    >
      <RouteTitle chainName={sourceChainName} sellAmount={sellCurrencyAmount} buyAmount={buyCurrencyAmount} />

      {!isBridgeStatusView && <TradeFeesAndCosts receiveAmountInfo={receiveAmountInfo} />}

      {isBridgeStatusView && status === StopStatusEnum.DONE && winningSolver && (
        <ConfirmDetailsItem label="Winning solver" withTimelineDot>
          <WinningSolverContainer>
            <b>{winningSolver.displayName || winningSolver.solver}</b>
            <img
              src={winningSolver.image || AMM_LOGOS[winningSolver.solver]?.src || AMM_LOGOS.default.src}
              alt={`${winningSolver.solver} logo`}
              width="16"
              height="16"
            />
          </WinningSolverContainer>
        </ConfirmDetailsItem>
      )}

      {!isBridgeStatusView && (
        <ConfirmDetailsItem
          withTimelineDot
          label={
            <>
              Expected to receive{' '}
              <InfoTooltip
                content={
                  <>
                    The estimated amount you\'ll receive after estimated network costs and the max slippage setting (
                    {slippagePercentDisplay}).
                  </>
                }
                size={14}
              />
            </>
          }
        >
          <TokenAmountDisplay currencyAmount={buyCurrencyAmount} displaySymbol usdValue={swapExpectedReceiveUsdValue} />
        </ConfirmDetailsItem>
      )}

      {!isBridgeStatusView && (
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
          {slippagePercentDisplay}
        </ConfirmDetailsItem>
      )}

      {isBridgeStatusView && shouldShowReceivedSection && receivedAmount && (
        <ConfirmDetailsItem
          label={
            <ReceiveAmountTitle>
              <b>Received</b>
            </ReceiveAmountTitle>
          }
        >
          <b>
            <TokenAmountDisplay currencyAmount={receivedAmount} displaySymbol usdValue={receivedAmountUsdValue} />
          </b>
        </ConfirmDetailsItem>
      )}

      {isBridgeStatusView && shouldShowReceivedSection && surplusAmount && surplusAmount.greaterThan(0) && (
        <ConfirmDetailsItem
          label={
            <ReceiveAmountTitle
              icon={
                <TimelineIconCircleWrapper>
                  <StyledTimelinePlusIcon src={PlusIcon} />
                </TimelineIconCircleWrapper>
              }
            >
              <SuccessTextBold>Surplus received</SuccessTextBold>
            </ReceiveAmountTitle>
          }
        >
          <SuccessTextBold>
            +{' '}
            <TokenAmountDisplay
              currencyAmount={surplusAmount}
              displaySymbol
              usdValue={surplusAmountUsdValue}
              hideTokenIcon={true}
            />
          </SuccessTextBold>
        </ConfirmDetailsItem>
      )}

      {!isBridgeStatusView && shouldShowReceivedSection && receivedAmount && (
        <ConfirmDetailsItem
          label={
            <ReceiveAmountTitle variant="success">
              =&nbsp;<b>Received</b>
            </ReceiveAmountTitle>
          }
          withTimelineDot
        >
          <b>
            <TokenAmountDisplay currencyAmount={receivedAmount} displaySymbol usdValue={receivedAmountUsdValue} />
          </b>
        </ConfirmDetailsItem>
      )}

      {!isBridgeStatusView && shouldShowReceivedSection && surplusAmount && surplusAmount.greaterThan(0) && (
        <ConfirmDetailsItem
          label={
            <ReceiveAmountTitle
              icon={
                <TimelineIconCircleWrapper>
                  <StyledTimelinePlusIcon src={PlusIcon} />
                </TimelineIconCircleWrapper>
              }
            >
              <SuccessTextBold>Surplus received</SuccessTextBold>
            </ReceiveAmountTitle>
          }
          contentTextColor={StatusColor.SUCCESS}
        >
          <b>
            +{' '}
            <TokenAmountDisplay
              currencyAmount={surplusAmount}
              displaySymbol
              usdValue={surplusAmountUsdValue}
              status={StatusColor.SUCCESS}
              hideTokenIcon={true}
            />
          </b>
        </ConfirmDetailsItem>
      )}

      {status === StopStatusEnum.PENDING && (
        <ConfirmDetailsItem label="Status" withTimelineDot>
          <StatusAwareText status={status}>
            In progress
            <AnimatedEllipsis isVisible={isAnimationVisible} />
          </StatusAwareText>
        </ConfirmDetailsItem>
      )}

      {!isBridgeStatusView &&
        status !== StopStatusEnum.FAILED &&
        status !== StopStatusEnum.REFUND_COMPLETE &&
        swapMinReceiveAmount &&
        !shouldShowReceivedSection && (
          <ConfirmDetailsItem
            label={<ReceiveAmountTitle>Min. to receive</ReceiveAmountTitle>}
            isLast={status !== StopStatusEnum.DONE && status !== StopStatusEnum.PENDING}
          >
            <b>
              <TokenAmountDisplay
                currencyAmount={swapMinReceiveAmount}
                displaySymbol
                usdValue={swapMinReceiveUsdValue}
              />
            </b>
          </ConfirmDetailsItem>
        )}

      {isBridgeStatusView &&
        status !== StopStatusEnum.FAILED &&
        status !== StopStatusEnum.REFUND_COMPLETE &&
        swapMinReceiveAmount &&
        !shouldShowReceivedSection && (
          <ConfirmDetailsItem
            label={
              <ReceiveAmountTitle>
                <b>Min. to receive</b>
              </ReceiveAmountTitle>
            }
            withTimelineDot
          >
            <b>
              <TokenAmountDisplay
                currencyAmount={swapMinReceiveAmount}
                displaySymbol
                usdValue={swapMinReceiveUsdValue}
              />
            </b>
          </ConfirmDetailsItem>
        )}

      {!isBridgeStatusView && recipient && (
        <ConfirmDetailsItem
          label={
            <>
              Recipient <InfoTooltip content="The address that will receive the tokens." size={14} />
            </>
          }
          withTimelineDot
        >
          <RecipientDisplay recipient={recipient} chainId={sourceChainId} />
        </ConfirmDetailsItem>
      )}
    </BridgeDetailsContainer>
  )
}
