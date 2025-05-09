import { ReactNode } from 'react'

import CarretIcon from '@cowprotocol/assets/cow-swap/carret-down.svg'
import CheckmarkIcon from '@cowprotocol/assets/cow-swap/checkmark.svg'
import RefundIcon from '@cowprotocol/assets/cow-swap/icon-refund.svg'
import SpinnerIcon from '@cowprotocol/assets/cow-swap/spinner.svg'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { FiatAmount, InfoTooltip } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import { ConfirmDetailsItem } from 'modules/trade/pure/ConfirmDetailsItem'
import { ReceiveAmountTitle } from 'modules/trade/pure/ReceiveAmountTitle'
import { UsdAmountInfo } from 'modules/usdAmount/hooks/useUsdAmount'

import { ProtocolIcons } from 'common/pure/ProtocolIcons'

import { getFeeTextColor } from './BridgeRouteBreakdown'
import { StyledRefundCompleteIcon } from './BridgeStopDetails'
import {
  AmountWithTokenIcon,
  ArrowIcon,
  StopNumberCircle,
  StopTitle,
  TokenFlowContainer,
  ClickableStopTitle,
  ToggleArrow,
  ToggleIconContainer,
  SectionContent,
  StyledSpinnerIcon,
} from './styled'

import { BridgeProtocolConfig, BridgeFeeType } from '../types'

export type StopStatus = 'default' | 'done' | 'pending' | 'failed' | 'refund_complete'

export interface SwapStopDetailsProps {
  isCollapsible?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  status?: StopStatus
  sellAmount: string
  sellToken: string
  sellTokenObj: TokenWithLogo
  buyAmount: string
  buyToken: string
  buyTokenObj: TokenWithLogo
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
}

export function SwapStopDetails({
  isCollapsible = false,
  isExpanded = true,
  onToggle = () => {},
  status,
  sellAmount,
  sellToken,
  sellTokenObj,
  buyAmount,
  buyToken,
  buyTokenObj,
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
}: SwapStopDetailsProps): ReactNode {
  const networkCostUsdValue = networkCostUsdResult?.value
  const swapExpectedReceiveUsdValue = swapExpectedReceiveUsdResult?.value
  const swapMinReceiveUsdValue = swapMinReceiveUsdResult?.value

  let titlePrefix = 'Swap on'
  if (status === 'done') {
    titlePrefix = 'Swapped on'
  } else if (status === 'pending') {
    titlePrefix = 'Swapping on'
  } else if (status === 'failed') {
    titlePrefix = 'Swap failed'
  } else if (status === 'refund_complete') {
    titlePrefix = 'Swap refunded'
  }

  const TitleContent = (
    <>
      <StopNumberCircle status={status} stopNumber={1}>
        {status === 'done' && <SVG src={CheckmarkIcon} />}
        {status === 'pending' && <StyledSpinnerIcon src={SpinnerIcon} />}
        {status === 'failed' && <SVG src={RefundIcon} />}
        {status === 'refund_complete' && <StyledRefundCompleteIcon src={RefundIcon} />}
      </StopNumberCircle>
      <b>
        <span>{titlePrefix} </span>
        <ProtocolIcons showOnlyFirst size={21} secondProtocol={bridgeProvider} />
        <span> CoW Protocol</span>
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
              <TokenLogo token={sellTokenObj} size={tokenLogoSize} />
              {sellAmount} {sellToken}
            </AmountWithTokenIcon>
            <ArrowIcon>→</ArrowIcon>
            <AmountWithTokenIcon>
              <TokenLogo token={buyTokenObj} size={tokenLogoSize} />
              {buyAmount} {buyToken} on {sourceChainName}
            </AmountWithTokenIcon>
          </TokenFlowContainer>
        </ConfirmDetailsItem>

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
          {networkCost} {sellToken}&nbsp;
          {networkCostUsdValue && (
            <i>
              (<FiatAmount amount={networkCostUsdValue} />)
            </i>
          )}
        </ConfirmDetailsItem>

        {swapExpectedToReceive && (
          <ConfirmDetailsItem
            withTimelineDot
            label={
              <>
                Expected to receive{' '}
                <InfoTooltip
                  content={`The estimated amount you'll receive after estimated network costs and the max slippage setting (${swapMaxSlippage}%).`}
                  size={14}
                />
              </>
            }
          >
            <AmountWithTokenIcon>
              {swapExpectedToReceive} {buyToken}
              {swapExpectedReceiveUsdValue && (
                <i>
                  (<FiatAmount amount={swapExpectedReceiveUsdValue} />)
                </i>
              )}
            </AmountWithTokenIcon>
          </ConfirmDetailsItem>
        )}

        {swapMaxSlippage && (
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

        {swapMinReceive && (
          <ConfirmDetailsItem
            label={
              <ReceiveAmountTitle>
                <b>Min. to receive</b>
              </ReceiveAmountTitle>
            }
          >
            <b>
              <AmountWithTokenIcon>
                <TokenLogo token={buyTokenObj} size={tokenLogoSize} />
                {swapMinReceive} {buyToken}
                {swapMinReceiveUsdValue && (
                  <i>
                    (<FiatAmount amount={swapMinReceiveUsdValue} />)
                  </i>
                )}
              </AmountWithTokenIcon>
            </b>
          </ConfirmDetailsItem>
        )}
      </SectionContent>
    </>
  )
}
