import { ReactNode } from 'react'

import CheckmarkIcon from '@cowprotocol/assets/cow-swap/checkmark.svg'
import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'
import PlusIcon from '@cowprotocol/assets/cow-swap/plus.svg'
import SpinnerIcon from '@cowprotocol/assets/cow-swap/spinner.svg'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink, isAddress, shortenAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { FiatAmount, InfoTooltip } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import SVG from 'react-inlinesvg'

import { AMM_LOGOS } from 'legacy/components/AMMsLogo'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReceiveAmountTitle } from 'modules/trade/pure/ReceiveAmountTitle'
import { UsdAmountInfo } from 'modules/usdAmount/hooks/useUsdAmount'

import { SolverCompetition } from 'common/hooks/orderProgressBar'

import { WinningSolverContainer } from './styled'

import {
  ArrowIcon,
  Link,
  SectionContent,
  StyledSpinnerIcon,
  SuccessTextBold,
  TokenFlowContainer,
  RecipientWrapper,
  TimelineIconCircleWrapper,
  StyledTimelinePlusIcon,
  StyledRefundCompleteIcon,
} from '../../styles'
import { BridgeProtocolConfig, BridgeFeeType } from '../../types'
import { getAmountString, getFeeTextColor, StatusColor, StopStatusEnum } from '../../utils'
import { NetworkLogo } from '../NetworkLogo'
import { StopHeader } from '../StopHeader/StopHeader'
import { TokenAmountDisplay } from '../TokenAmountDisplay'

const StopStatusIconsMap: Record<StopStatusEnum, ReactNode> = {
  [StopStatusEnum.DONE]: <SVG src={CheckmarkIcon} />,
  [StopStatusEnum.PENDING]: <StyledSpinnerIcon src={SpinnerIcon} />,
  [StopStatusEnum.FAILED]: <SVG src={RefundIcon} />,
  [StopStatusEnum.REFUND_COMPLETE]: <StyledRefundCompleteIcon src={RefundIcon} />,
  [StopStatusEnum.DEFAULT]: null,
}

const StopStatusTitlePrefixes: Record<StopStatusEnum, ReactNode> = {
  [StopStatusEnum.DONE]: 'Swapped on',
  [StopStatusEnum.PENDING]: 'Swapping on',
  [StopStatusEnum.FAILED]: 'Swap failed',
  [StopStatusEnum.REFUND_COMPLETE]: 'Swap refunded',
  [StopStatusEnum.DEFAULT]: 'Swap on',
}

export interface SwapStopDetailsProps {
  isCollapsible?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  status?: StopStatusEnum
  sellCurrencyAmount: CurrencyAmount<TokenWithLogo>
  buyCurrencyAmount: CurrencyAmount<TokenWithLogo>
  sourceChainName: string
  networkCost: string
  networkCostUsdResult?: UsdAmountInfo | null
  swapExpectedToReceive?: string
  swapExpectedReceiveUsdResult?: UsdAmountInfo | null
  swapMaxSlippage?: string
  swapMinReceive?: string
  swapMinReceiveUsdResult?: UsdAmountInfo | null
  tokenLogoSize: number
  bridgeProvider: BridgeProtocolConfig
  recipient?: string
  sourceChainId: SupportedChainId
  winningSolver?: SolverCompetition | null
  receivedAmount?: CurrencyAmount<TokenWithLogo> | null
  receivedAmountUsdResult?: UsdAmountInfo | null
  surplusAmount?: CurrencyAmount<TokenWithLogo> | null
  surplusAmountUsdResult?: UsdAmountInfo | null
  swapExplorerUrl?: string
}

export function SwapStopDetails({
  isCollapsible = false,
  isExpanded = true,
  onToggle = () => {},
  status = StopStatusEnum.DEFAULT,
  sellCurrencyAmount,
  buyCurrencyAmount,
  sourceChainName,
  networkCost,
  networkCostUsdResult,
  swapExpectedToReceive,
  swapExpectedReceiveUsdResult,
  swapMaxSlippage,
  swapMinReceive,
  swapMinReceiveUsdResult,
  tokenLogoSize,
  bridgeProvider,
  recipient,
  sourceChainId,
  winningSolver = null,
  receivedAmount = null,
  receivedAmountUsdResult = null,
  surplusAmount = null,
  surplusAmountUsdResult = null,
  swapExplorerUrl,
}: SwapStopDetailsProps): ReactNode {
  const sellToken = sellCurrencyAmount.currency
  const sellAmount = sellCurrencyAmount.toSignificant(6)
  const sellTokenSymbol = sellToken.symbol || '???'

  const buyToken = buyCurrencyAmount.currency
  const buyAmount = buyCurrencyAmount.toSignificant(6)
  const buyTokenSymbol = buyToken.symbol || '???'

  const networkCostUsdValue = networkCostUsdResult?.value
  const swapExpectedReceiveUsdValue = swapExpectedReceiveUsdResult?.value
  const swapMinReceiveUsdValue = swapMinReceiveUsdResult?.value
  const receivedAmountUsdValue = receivedAmountUsdResult?.value
  const surplusAmountUsdValue = surplusAmountUsdResult?.value

  // Check if we're in the BridgeStatus with solver data
  const isBridgeStatusView = winningSolver !== null || receivedAmount !== null

  // For BridgeStatus view, always show received section if we have received amount
  // For normal views, only show it in DONE status
  const shouldShowReceivedSection = isBridgeStatusView
    ? receivedAmount !== null
    : status === StopStatusEnum.DONE && receivedAmount !== null

  return (
    <>
      <StopHeader
        status={status}
        stopNumber={1}
        statusIcons={StopStatusIconsMap}
        statusTitlePrefix={StopStatusTitlePrefixes[status]}
        protocolName="CoW Protocol"
        protocolIconSize={21}
        protocolIconShowOnly="first"
        protocolIconBridgeProvider={bridgeProvider}
        isCollapsible={isCollapsible}
        isExpanded={isExpanded}
        onToggle={onToggle}
        explorerUrl={swapExplorerUrl}
      />

      <SectionContent isExpanded={isExpanded}>
        <ConfirmDetailsItem label="" withTimelineDot>
          <TokenFlowContainer>
            <TokenAmountDisplay
              token={sellToken}
              amount={sellAmount}
              displaySymbol={sellTokenSymbol}
              tokenLogoSize={tokenLogoSize}
              hideFiatAmount={true}
            />
            <ArrowIcon>→</ArrowIcon>
            <TokenAmountDisplay
              token={buyToken}
              amount={buyAmount}
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
            {networkCost} {sellTokenSymbol}&nbsp;
            {networkCostUsdValue && (
              <i>
                (<FiatAmount amount={networkCostUsdValue} />)
              </i>
            )}
          </ConfirmDetailsItem>
        )}

        {!isBridgeStatusView && swapExpectedToReceive && (
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
              amount={swapExpectedToReceive}
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

        {/* Standard recipient display for normal fixtures */}
        {!isBridgeStatusView && recipient && (
          <ConfirmDetailsItem
            label={
              <>
                Recipient <InfoTooltip content="The address that will receive the tokens." size={14} />
              </>
            }
            withTimelineDot
          >
            <RecipientWrapper>
              <NetworkLogo chainId={sourceChainId} size={16} />
              {isAddress(recipient) ? (
                <Link
                  href={getExplorerLink(sourceChainId, recipient, ExplorerDataType.ADDRESS)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shortenAddress(recipient)} ↗
                </Link>
              ) : (
                recipient
              )}
            </RecipientWrapper>
          </ConfirmDetailsItem>
        )}

        {/* Show received amount for BridgeStatus view */}
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
                amount={getAmountString(receivedAmount)}
                displaySymbol={buyTokenSymbol}
                usdValue={receivedAmountUsdValue}
                tokenLogoSize={tokenLogoSize}
              />
            </b>
          </ConfirmDetailsItem>
        )}

        {/* Show surplus with custom plus icon for BridgeStatus view */}
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
                amount={getAmountString(surplusAmount)}
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
                amount={getAmountString(receivedAmount)}
                displaySymbol={buyTokenSymbol}
                usdValue={receivedAmountUsdValue}
                tokenLogoSize={tokenLogoSize}
              />
            </b>
          </ConfirmDetailsItem>
        )}

        {/* Show surplus with plus sign for normal fixtures */}
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
                amount={getAmountString(surplusAmount)}
                displaySymbol={buyTokenSymbol}
                usdValue={surplusAmountUsdValue}
                tokenLogoSize={tokenLogoSize}
                status={StatusColor.SUCCESS}
                hideTokenIcon={true}
              />
            </b>
          </ConfirmDetailsItem>
        )}

        {/* Min to receive for non-BridgeStatus views when needed */}
        {!isBridgeStatusView &&
          status !== StopStatusEnum.FAILED &&
          status !== StopStatusEnum.REFUND_COMPLETE &&
          swapMinReceive &&
          !shouldShowReceivedSection && (
            <ConfirmDetailsItem
              label={<ReceiveAmountTitle>Min. to receive</ReceiveAmountTitle>}
              isLast={status !== StopStatusEnum.DONE && status !== StopStatusEnum.PENDING}
            >
              <b>
                <TokenAmountDisplay
                  token={buyToken}
                  amount={swapMinReceive}
                  displaySymbol={buyTokenSymbol}
                  usdValue={swapMinReceiveUsdValue}
                  tokenLogoSize={tokenLogoSize}
                />
              </b>
            </ConfirmDetailsItem>
          )}

        {/* Min to receive for BridgeStatus view */}
        {isBridgeStatusView &&
          status !== StopStatusEnum.FAILED &&
          status !== StopStatusEnum.REFUND_COMPLETE &&
          swapMinReceive &&
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
                  amount={swapMinReceive}
                  displaySymbol={buyTokenSymbol}
                  usdValue={swapMinReceiveUsdValue}
                  tokenLogoSize={tokenLogoSize}
                />
              </b>
            </ConfirmDetailsItem>
          )}
      </SectionContent>
    </>
  )
}
