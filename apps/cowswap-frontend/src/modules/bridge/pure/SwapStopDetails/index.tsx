import { ReactNode } from 'react'

import PlusIcon from '@cowprotocol/assets/cow-swap/plus.svg'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { InfoTooltip } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReceiveAmountTitle } from 'modules/trade/pure/ReceiveAmountTitle'
import { UsdAmountInfo } from 'modules/usdAmount/hooks/useUsdAmount'

import { SolverCompetition } from 'common/hooks/orderProgressBar'

import { WinningSolverContainer } from './styled'

import {
  ArrowIcon,
  SuccessTextBold,
  TokenFlowContainer,
  TimelineIconCircleWrapper,
  StyledTimelinePlusIcon,
  StatusAwareText,
  AnimatedEllipsis,
} from '../../styles'
import { BridgeProtocolConfig, BridgeFeeType } from '../../types'
import { getFeeTextColor, StatusColor, StopStatusEnum } from '../../utils'
import { BridgeDetailsContainer } from '../BridgeDetailsContainer'
import { RecipientDisplay } from '../RecipientDisplay'
import { SwapStatusIcons, SwapStatusTitlePrefixes } from '../StopStatus'
import { TokenAmountDisplay } from '../TokenAmountDisplay'

export interface SwapStopDetailsProps {
  isCollapsible?: boolean
  defaultExpanded?: boolean
  onExpansionToggle?: (isExpanded: boolean) => void
  status?: StopStatusEnum
  sellCurrencyAmount: CurrencyAmount<TokenWithLogo>
  buyCurrencyAmount: CurrencyAmount<TokenWithLogo>
  sourceChainName: string
  networkCostAmount?: CurrencyAmount<TokenWithLogo>
  networkCostUsdInfo?: UsdAmountInfo | null
  swapExpectedToReceiveAmount?: CurrencyAmount<TokenWithLogo>
  swapExpectedReceiveUsdInfo?: UsdAmountInfo | null
  swapMaxSlippage?: string
  swapMinReceiveAmount?: CurrencyAmount<TokenWithLogo>
  swapMinReceiveUsdInfo?: UsdAmountInfo | null
  tokenLogoSize: number
  bridgeProvider: BridgeProtocolConfig
  recipient?: string
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
  onExpansionToggle,
  status = StopStatusEnum.DEFAULT,
  sellCurrencyAmount,
  buyCurrencyAmount,
  sourceChainName,
  networkCostAmount,
  networkCostUsdInfo,
  swapExpectedToReceiveAmount,
  swapExpectedReceiveUsdInfo,
  swapMaxSlippage,
  swapMinReceiveAmount,
  swapMinReceiveUsdInfo,
  tokenLogoSize,
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
  const sellToken = sellCurrencyAmount.currency
  const sellTokenSymbol = sellToken.symbol || '???'

  const buyToken = buyCurrencyAmount.currency
  const buyTokenSymbol = buyToken.symbol || '???'

  const networkCostUsdValue = networkCostUsdInfo?.value
  const swapExpectedReceiveUsdValue = swapExpectedReceiveUsdInfo?.value
  const swapMinReceiveUsdValue = swapMinReceiveUsdInfo?.value
  const receivedAmountUsdValue = receivedAmountUsdInfo?.value
  const surplusAmountUsdValue = surplusAmountUsdInfo?.value

  const isBridgeStatusView = winningSolver !== null || receivedAmount !== null
  const shouldShowReceivedSection = isBridgeStatusView
    ? receivedAmount !== null
    : status === StopStatusEnum.DONE && receivedAmount !== null

  const isAnimationVisible = defaultExpanded && (status === StopStatusEnum.PENDING || status === StopStatusEnum.FAILED)

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
      onToggle={onExpansionToggle}
      explorerUrl={swapExplorerUrl}
    >
      <ConfirmDetailsItem label="" withTimelineDot>
        <TokenFlowContainer>
          <TokenAmountDisplay
            token={sellToken}
            currencyAmount={sellCurrencyAmount}
            displaySymbol={sellTokenSymbol}
            tokenLogoSize={tokenLogoSize}
            hideFiatAmount={true}
          />
          <ArrowIcon>→</ArrowIcon>
          <TokenAmountDisplay
            token={buyToken}
            currencyAmount={buyCurrencyAmount}
            displaySymbol={buyTokenSymbol}
            tokenLogoSize={tokenLogoSize}
            hideFiatAmount={true}
          />
          {` on ${sourceChainName}`}
        </TokenFlowContainer>
      </ConfirmDetailsItem>

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
          label={
            <>
              Swap fee <InfoTooltip content="No fee for order placement!" size={14} />
            </>
          }
          withTimelineDot
          contentTextColor={getFeeTextColor(BridgeFeeType.FREE)}
        >
          FREE
        </ConfirmDetailsItem>
      )}

      {!isBridgeStatusView && (
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
          {networkCostAmount ? (
            <TokenAmountDisplay
              token={sellToken}
              currencyAmount={networkCostAmount}
              displaySymbol={sellTokenSymbol}
              usdValue={networkCostUsdValue}
              tokenLogoSize={tokenLogoSize}
            />
          ) : (
            '-'
          )}
        </ConfirmDetailsItem>
      )}

      {!isBridgeStatusView && swapExpectedToReceiveAmount && (
        <ConfirmDetailsItem
          withTimelineDot
          label={
            <>
              Expected to receive{' '}
              <InfoTooltip
                content={`The estimated amount you\'ll receive after estimated network costs and the max slippage setting (${swapMaxSlippage}%).`}
                size={14}
              />
            </>
          }
        >
          <TokenAmountDisplay
            token={buyToken}
            currencyAmount={swapExpectedToReceiveAmount}
            displaySymbol={buyTokenSymbol}
            usdValue={swapExpectedReceiveUsdValue}
            tokenLogoSize={tokenLogoSize}
          />
        </ConfirmDetailsItem>
      )}

      {!isBridgeStatusView && swapMaxSlippage && (
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

      {isBridgeStatusView && shouldShowReceivedSection && receivedAmount && (
        <ConfirmDetailsItem
          label={
            <ReceiveAmountTitle>
              <b>Received</b>
            </ReceiveAmountTitle>
          }
        >
          <b>
            <TokenAmountDisplay
              token={buyToken}
              currencyAmount={receivedAmount}
              displaySymbol={buyTokenSymbol}
              usdValue={receivedAmountUsdValue}
              tokenLogoSize={tokenLogoSize}
            />
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
              token={buyToken}
              currencyAmount={surplusAmount}
              displaySymbol={buyTokenSymbol}
              usdValue={surplusAmountUsdValue}
              tokenLogoSize={tokenLogoSize}
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
            <TokenAmountDisplay
              token={buyToken}
              currencyAmount={receivedAmount}
              displaySymbol={buyTokenSymbol}
              usdValue={receivedAmountUsdValue}
              tokenLogoSize={tokenLogoSize}
            />
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
              token={buyToken}
              currencyAmount={surplusAmount}
              displaySymbol={buyTokenSymbol}
              usdValue={surplusAmountUsdValue}
              tokenLogoSize={tokenLogoSize}
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
                token={buyToken}
                currencyAmount={swapMinReceiveAmount}
                displaySymbol={buyTokenSymbol}
                usdValue={swapMinReceiveUsdValue}
                tokenLogoSize={tokenLogoSize}
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
                token={buyToken}
                currencyAmount={swapMinReceiveAmount}
                displaySymbol={buyTokenSymbol}
                usdValue={swapMinReceiveUsdValue}
                tokenLogoSize={tokenLogoSize}
              />
            </b>
          </ConfirmDetailsItem>
        )}
    </BridgeDetailsContainer>
  )
}
